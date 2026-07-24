const Approval = require("../models/approval");
const Bill = require("../models/bill");
const Customer = require("../models/customer");
const Env_Variable = require("../models/env_variable");
const Index = require("../models/index");
const Kaarigar = require("../models/list_master/kaarigar");
const Ornament = require("../models/list_master/ornament");
const Prefix = require("../models/list_master/prefix");
const Purity = require("../models/list_master/purity");
const StockType = require("../models/list_master/stocktype");
const StoneDealer = require("../models/list_master/stonedealer");
const StoneType = require("../models/list_master/stonetype");
const DailyUpdateList = require("../models/DailyUpdateList");
const Permission = require("../models/permission");
const Stock = require("../models/stock");
const User = require("../models/user");
const Temp = require("../models/temp");
const stockViewController = require("../controllers/stock_view_controller");
module.exports.checkPermission = (listname) => {
  return async (req, res, next) => {
    try {
      let user = await User.findById(req.user.id);
      let adminPermission = await Permission.findOne({
        listname: "admin"
      });
      if (adminPermission.users.includes(user.id)) {
        return next();
      }
      let permission = await Permission.findOne({
        listname: listname
      });
      if (!permission) {
        permission = await Permission.create({
          listname: listname,
          nickname: listname
        });
      }
      if (!permission.users.includes(user.id)) {
        req.flash("error", "You don't have necessary permissions!");
        return res.redirect(req.get("Referrer") || "/");
      }
      next();
    } catch (err) {
      console.log("Error in Permission Check!", err);
      req.flash("error", "Error in Permission Check!");
      return res.redirect(req.get("Referrer") || "/");
    }
  };
};
module.exports.generateTagName = function (item) {
  return (
    (item.prefix ? item.prefix.name + " " : "") +
    (item.ornament ? item.ornament.name : "") +
    (item.tag ? " - " + item.tag : "")
  );
};
module.exports.convertTime = function (date) {
  if (date === null || date === undefined) {
    return "";
  }
  let today = new Date(date);
  let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  let result =
    today.getDate() +
    " " +
    month[today.getMonth()] +
    " " +
    today.getFullYear() +
    " ( " +
    (today.getHours() >= 10 ? today.getHours() : "0" + today.getHours()) +
    ":" +
    (today.getMinutes() >= 10 ? today.getMinutes() : "0" + today.getMinutes()) +
    ":" +
    (today.getSeconds() >= 10 ? today.getSeconds() : "0" + today.getSeconds()) +
    " )";
  return result;
};
module.exports.convertDate = function (date) {
  let b = new Date(date);
  let time = b
    .toString()
    .slice(0, 21)
    .split("")
    .reverse()
    .join("")
    .slice(0, 5)
    .split("")
    .reverse()
    .join("");
  let month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "July",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
  ];
  let a =
    b.getDate() +
    " " +
    month[b.getMonth()] +
    " " +
    b.getFullYear() +
    " " +
    " at " +
    time;
  return a;
};
module.exports.sortByProperty = function (property, n) {
  // 1 ascending -1 descending
  return function (a, b) {
    if (a[property].toLowerCase() > b[property].toLowerCase()) return n * 1;
    else if (a[property].toLowerCase() < b[property].toLowerCase())
      return n * -1;
    return 0;
  };
};
module.exports.calculatePrice = async function (item) {
  let temp = await Env_Variable.findOne({
    name: "goldPrice"
  });
  goldPrice = temp.value * 1;
  let goldRate = item.isKDM ? goldPrice * 1.1 : goldPrice;
  item.sellingPrice =
    (item.purity.retailMultiplier *
      item.netWt *
      goldRate *
      (100 + item.purity.wastage * 1)) /
    100.0 /
    100.0;
  for (let j = 0; j < item.stoneTable.length; j++) {
    let stoneWt = item.stoneTable[j].ctWeight * 1;
    let stoneRate = item.stoneTable[j].sellRate * 1;
    stoneWt = stoneWt ? stoneWt : 1;
    item.sellingPrice += stoneWt * stoneRate;
  }
  item.sellingPrice = item.sellingPrice.toFixed(0);
};
module.exports.AppName = async function () {
  let temp = await Env_Variable.findOne({
    name: "AppName"
  });
  if (!temp) {
    temp = await Env_Variable.create({
      name: "AppName",
      nickname: "App Name",
      value: "Jewellery"
    });
  }
  return temp.value;
};
module.exports.scheduleDailyUpdateList = async function () {
  try {
    let lists = await stockViewController.createLists();
    await DailyUpdateList.create({
      arrival: lists[0],
      edit: lists[1],
      sold: lists[2],
      deleted: lists[3],
      totalApproval: lists[4],
      approvalGive: lists[5],
      approvalTake: lists[6],
      closing: lists[7]
    });
  } catch (err) {
    console.log("Error in Schedule Daily Update List!", err);
  }
};
module.exports.scheduleDeleteAfterXDays = async function () {
  try {
    let env = require("../config/environment");
    let path = require("path");
    let imagePath = Stock.imagePath;
    let fs = require("fs");
    let date = new Date();
    let XthDay = new Date(date.setHours(23, 59, 59, 999));
    let tempXDaysToDelete = await Env_Variable.findOne({
      name: "XDaysToDelete"
    });
    let XDaysToDelete = tempXDaysToDelete.value * 1;
    let daysInMillis = XDaysToDelete * 24 * 60 * 60 * 1000;
    XthDay = new Date(XthDay.getTime() - daysInMillis);
    console.log(XthDay.toLocaleString());
    let billTable = await Bill.find({
      customer: {
        $exists: false
      },
      createdAt: {
        $lte: XthDay
      }
    });
    for (let eachBill of billTable) {
      for (let eachStockID of eachBill.cart) {
        let eachStock = await Stock.findById(eachStockID);
        for (let item of eachStock.stockImage) {
          if (await fs.existsSync(path.join(imagePath, item.fileName))) {
            await fs.unlinkSync(path.join(imagePath, item.fileName));
          }
        }
        await Stock.findByIdAndDelete(eachStockID);
      }
      await Bill.findByIdAndDelete(eachBill);
    }
    await Approval.deleteMany({
      receivedDate: {
        $exists: true
      },
      createdAt: {
        $lte: XthDay
      }
    });
    await DailyUpdateList.deleteMany({
      createdAt: {
        $lte: XthDay
      }
    });
  } catch (err) {
    console.log("Error in Schedule Daily Update List!", err);
  }
};
async function initPermission() {
  let XUSER = await User.find();
  if (XUSER.length) {
    return;
  }
  await Permission.deleteMany();
  await User.deleteMany();
  await Env_Variable.deleteMany();
  let user = await User.create({
    name: "Divyansh Bansal",
    email: "divyanshbansal4224@gmail.com",
    adminPermissionPerm: true,
    adminPermissionTemp: true,
    cart: []
  });
  let arr = `[
        {"listname": "admin", "nickname": "Administrator"},
        {"listname": "approvalAdd", "nickname": "Approval Add"},
        {"listname": "approvalRecv", "nickname": "Approval Recv"},
        {"listname": "approvalView", "nickname": "Approval View"},
        {"listname": "billView", "nickname": "Bill View"},
        {"listname": "CustomerAdd", "nickname": "Customer Add"},
        {"listname": "CustomerAddPayment", "nickname": "Customer Add Payment"},
        {"listname": "CustomerDelPayment", "nickname": "Customer Delete Payment"},
        {"listname": "CustomerDelBill", "nickname": "Customer Delete Bill"},
        {"listname": "CustomerSettle", "nickname": "Customer Settle"},
        {"listname": "CustomerEdit", "nickname": "Customer Edit"},
        {"listname": "CustomerView", "nickname": "Customer View"},
        {"listname": "dataAllInStock", "nickname": "Data All In Stock"},
        {"listname": "dataAllOutStock", "nickname": "Data All Out Stock"},
        {"listname": "dataAllStock", "nickname": "Data All Stock"},
        {"listname": "dataBackDateSheet", "nickname": "Data Back Date Sheet"},
        {"listname": "dataDailySheet", "nickname": "Data Daily Sheet"},
        {"listname": "dataPage", "nickname": "Data Page"},
        {"listname": "goldPrice", "nickname": "Gold Price"},
        {"listname": "ListKaarigar", "nickname": "List Kaarigar"},
        {"listname": "ListMaster", "nickname": "List Master"},
        {"listname": "ListOrnament", "nickname": "List Ornament"},
        {"listname": "ListPrefix", "nickname": "List Prefix"},
        {"listname": "ListPurity", "nickname": "List Purity"},
        {"listname": "ListStockType", "nickname": "List StockType"},
        {"listname": "ListStoneDealer", "nickname": "List Stone Dealer"},
        {"listname": "ListStoneType", "nickname": "List Stone Type"},
        {"listname": "stockAdd", "nickname": "Stock Add"},
        {"listname": "stockEdit", "nickname": "Stock Edit"},
        {"listname": "stockImageEdit", "nickname": "Stock Image Edit"},
        {"listname": "stockEditMultiple", "nickname": "Stock Edit Multiple"},
        {"listname": "stockSell", "nickname": "Stock Sell"},
        {"listname": "stockView", "nickname": "Stock View"},
        {"listname": "tags", "nickname": "Tags Print"}
    ]`;
  arr = JSON.parse(arr);
  for (let i = 0; i < arr.length; i++) {
    await Permission.create({
      listname: arr[i].listname,
      nickname: arr[i].nickname,
      users: [user.id]
    });
  }
  let envVariables = `[
            { "nickname": "App Name", "name": "AppName", "defaultValue": "Jewellery", "disabled":false },
            { "nickname": "Tag Name", "name": "TagName", "defaultValue": "Jeweller", "disabled":false },
            { "nickname": "Gold Price", "name": "goldPrice", "defaultValue": "0", "disabled":false },
            { "nickname": "Days Before Delete", "name": "XDaysToDelete", "defaultValue": "365", "disabled":false },
            { "nickname": "Start Hour", "name": "startHour", "defaultValue": "10", "disabled":false },
            { "nickname": "End Hour", "name": "endHour", "defaultValue": "20", "disabled":false },
            { "nickname": "Days Allowed", "name": "daysAllowed", "defaultValue": "false true true true true true true", "disabled":false },
            { "nickname": "Mail ID (Without @)", "name": "mailUser", "defaultValue": "Jeweller", "disabled":false },
            { "nickname": "Mail Password", "name": "mailPassword", "defaultValue": "XXXXXXXXX", "disabled":false },
            { "nickname": "Mail From (With @)", "name": "mailFrom", "defaultValue": "jeweller@gmail.com", "disabled":false },
            { "nickname": "Mail To (With @)", "name": "backUpMail", "defaultValue": "jeweller@gmail.com", "disabled":false },
            { "nickname": "Google ClientID", "name": "google_clientID", "defaultValue": "1040813539779-e2bm980dlnbra89pmsiscont0q4om6rp.apps.googleusercontent.com", "disabled":true },
            { "nickname": "Google ClientSecret", "name": "google_clientSecret", "defaultValue": "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", "disabled":true },
            { "nickname": "Google CallbackURL", "name": "google_callbackURL", "defaultValue": "http://stock.divyanshbansal.com/users/auth/google/callback", "disabled":true }
        ]`;
  envVariables = JSON.parse(envVariables);
  for (let i = 0; i < envVariables.length; i++) {
    await Env_Variable.create({
      name: envVariables[i].name,
      nickname: envVariables[i].nickname,
      value: envVariables[i].defaultValue
    });
  }
  console.log("done");
}

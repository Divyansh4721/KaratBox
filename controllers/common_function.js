const Approval = require("../models/approval");
const Bill = require("../models/bill");
const Customer = require("../models/customer");
const Env_Variable = require("../models/env_variable");
const Index = require("../models/index");
const Kaarigar = require("../models/list_kaarigar");
const Ornament = require("../models/list_ornament");
const Prefix = require("../models/list_prefix");
const Purity = require("../models/list_purity");
const StockType = require("../models/list_stocktype");
const StoneDealer = require("../models/list_stonedealer");
const StoneType = require("../models/list_stonetype");
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
    let STOCK_PATH = path.join(env.assetPath);
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
    // View Data
    // {
    //     let temp = await Bill.find({
    //         customer: {
    //             $exists: false,
    //         },
    //         createdAt: {
    //             $lte: XthDay,
    //         },
    //     });
    //     console.log(temp);
    //     temp = await Approval.find({
    //         receivedDate: {
    //             $exists: true,
    //         },
    //         createdAt: {
    //             $lte: XthDay,
    //         }
    //     });
    //     console.log(temp);
    //     temp = await DailyUpdateList.find({
    //         createdAt: {
    //             $lte: XthDay,
    //         }
    //     });
    //     console.log(temp.length);
    // }
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
          if (await fs.existsSync(path.join(STOCK_PATH, item.fileName))) {
            await fs.unlinkSync(path.join(STOCK_PATH, item.fileName));
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
        {"listname": "admin", "nickname": "Adminstrator"},
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
async function initTable() {
  let temp = await Temp.find();
  let xyd = [...new Set(temp.map((item) => item.Purity))];
  xyd = [...new Set(temp.map((item) => item.Kaarigar))];
  xyd = xyd.filter((item) => item);
  for (let i of xyd) {
    let x = await Kaarigar.findOne({
      name: i
    });
    if (!x)
      x = await Kaarigar.create({
        name: i
      });
  }
  xyd = [...new Set(temp.map((item) => item.Ornament))];
  xyd = xyd.filter((item) => item);
  for (let i of xyd) {
    let x = await Ornament.findOne({
      name: i
    });
    if (!x)
      x = await Ornament.create({
        name: i
      });
  }
  xyd = [...new Set(temp.map((item) => item.Prefix))];
  xyd = xyd.filter((item) => item);
  xyd.push("");
  for (let i of xyd) {
    let x = await Prefix.findOne({
      name: i
    });
    if (!x)
      x = await Prefix.create({
        name: i
      });
  }
  xyd = [...new Set(temp.map((item) => item.StockType))];
  xyd = xyd.filter((item) => item);
  for (let i of xyd) {
    let x = await StockType.findOne({
      name: i
    });
    if (!x)
      x = await StockType.create({
        name: i
      });
  }
  xyd = [...new Set(temp.map((item) => item.StoneType))];
  xyd = xyd.filter((item) => item);
  for (let i of xyd) {
    let x = await StoneType.findOne({
      name: i
    });
    if (!x)
      x = await StoneType.create({
        name: i
      });
  }
  console.log("done");
}
async function loadTempTable() {
  // await Index.deleteMany();
  // await Index.create({
  //     name: "sku",
  //     available: []
  // })
  // await Index.create({
  //     name: "index",
  //     index: 0
  // })
  // Indexes
  // {
  //     let prefix = await Prefix.find();
  //     let ornament = await Ornament.find();
  //     for (let i = 0; i < prefix.length; i++) {
  //         for (let j = 0; j < ornament.length; j++) {
  //             await Index.create({
  //                 prefix: prefix[i],
  //                 ornament: ornament[j],
  //                 available: []
  //             });
  //         }
  //     }
  // }
  function parseDate(dateString) {
    let [day, month, year] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  // await Stock.deleteMany();
  let temp = await Temp.find().sort({
    Index: 1
  });
  for (let i = 0; i < temp.length; i++) {
    console.log(i);
    console.log(temp[i]);
    let envVar = await Index.findOne({
      name: "index"
    });
    envVar.index = envVar.index * 1 + 1;
    await envVar.save();
    let indexNo = envVar.index;
    let tag = temp[i].Tag;
    // temp[i].Prefix = temp[i].Prefix ? temp[i].Prefix : "";
    let prefix = await Prefix.findOne({
      name: temp[i].Prefix
    });
    let ornament = await Ornament.findOne({
      name: temp[i].Ornament
    });
    let grossWt = (temp[i].GrossWt * 1).toFixed(3);
    let stoneWt = (temp[i].StoneWt * 1).toFixed(3);
    let netWt = (temp[i].NetWt * 1).toFixed(3);
    // let kaarigar = await Kaarigar.findOne({
    //     name: temp[i].Kaarigar
    // })
    // temp[i].StockType = temp[i].StockType ? temp[i].StockType : "None";
    let stockType = await StockType.findOne({
      name: temp[i].StockType
    });
    let remark = temp[i].Remark;
    let HUID = "";
    let purity = await Purity.findOne({
      name: temp[i].Purity
    });
    // let isKDM = temp[i].IsKDM;
    let isKDM = false;
    let isInStock = true;
    let user = await User.findOne({
      email: "divyanshbansal4224@gmail.com"
    });
    let createdBy = user;
    let createdDate = parseDate(temp[i].Date);
    let stoneTable = [];
    let x = await StoneType.findOne({
      name: temp[i].StoneType1
    });
    if (temp[i].StoneType1) {
      x = {
        type: x,
        ctWeight: (temp[i].StoneWeight1 * 1).toFixed(3),
        gmWeight: (temp[i].StoneWeight1 / 5).toFixed(3),
        sellRate: (
          (temp[i].StoneRate1 * 1) /
          (temp[i].StoneWeight1 * 1)
        ).toFixed(0),
        purchaseRate: 0,
        dealerName: null
      };
      stoneTable.push(x);
    }
    x = await StoneType.findOne({
      name: temp[i].StoneType2
    });
    if (temp[i].StoneType2) {
      x = {
        type: x,
        ctWeight: (temp[i].StoneWeight2 * 1).toFixed(3),
        gmWeight: (temp[i].StoneWeight2 / 5).toFixed(3),
        sellRate: (
          (temp[i].StoneRate2 * 1) /
          (temp[i].StoneWeight2 * 1)
        ).toFixed(0),
        purchaseRate: 0,
        dealerName: null
      };
      stoneTable.push(x);
    }
    x = await StoneType.findOne({
      name: temp[i].StoneType3
    });
    if (temp[i].StoneType3) {
      x = {
        type: x,
        ctWeight: (temp[i].StoneWeight3 * 1).toFixed(3),
        gmWeight: (temp[i].StoneWeight3 / 5).toFixed(3),
        sellRate: (
          (temp[i].StoneRate3 * 1) /
          (temp[i].StoneWeight3 * 1)
        ).toFixed(0),
        purchaseRate: 0,
        dealerName: null
      };
      stoneTable.push(x);
    }
    x = await StoneType.findOne({
      name: temp[i].StoneType4
    });
    if (temp[i].StoneType4) {
      x = {
        type: x,
        ctWeight: (temp[i].StoneWeight4 * 1).toFixed(3),
        gmWeight: (temp[i].StoneWeight4 / 5).toFixed(3),
        sellRate: ((temp[i].StoneRate4 * 1) / 1).toFixed(0),
        purchaseRate: 0,
        dealerName: null
      };
      stoneTable.push(x);
    }
    let stockImage = [];
    // if (temp[i].PictureName) {
    x = {
      fileName: indexNo + "-1.png"
    };
    stockImage.push(x);
    // }
    let tempStock = await Stock.create({
      index: indexNo,
      tag,
      prefix,
      ornament,
      grossWt,
      netWt,
      stoneWt,
      stockType,
      purity,
      isInStock,
      createdBy,
      createdDate,
      stoneTable,
      stockImage,
      isKDM
    });
    tempStock.kaarigar = undefined;
    tempStock.HUID = HUID ? HUID : "";
    tempStock.remark = remark ? remark : "";
    await tempStock.save();
    let index = await Index.findOne({
      prefix,
      ornament
    });
    index.available.push(tag * 1);
    await index.save();
  }
}

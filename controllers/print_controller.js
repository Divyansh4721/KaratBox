const Index = require("../models/index");
const Kaarigar = require("../models/list_master/kaarigar");
const Approval = require("../models/approval");
const Bill = require("../models/bill");
const Ornament = require("../models/list_master/ornament");
const Prefix = require("../models/list_master/prefix");
const Purity = require("../models/list_master/purity");
const StockType = require("../models/list_master/stocktype");
const StoneDealer = require("../models/list_master/stonedealer");
const StoneType = require("../models/list_master/stonetype");
const Stock = require("../models/stock");
const User = require("../models/user");
const Env_Variable = require("../models/env_variable");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
module.exports.printInventory = async function (req, res) {
  try {
    let stockTable = [];
    if (req.query.path === "approval") {
      let approval = await Approval.findById(req.query.id);
      stockTable = approval.cart;
    }
    if (req.query.path === "cart") {
      let user = await User.findById(req.user);
      stockTable = user.cart;
    }
    if (req.query.path === "bill") {
      let bill = await Bill.findById(req.query.id);
      stockTable = bill.cart;
    }
    stockTable = await Stock.find({
      _id: {
        $in: stockTable
      }
    })
      .populate("prefix ornament purity stockType stoneTable.type")
      .sort({
        prefix: 1,
        ornament: 1,
        tag: 1
      });
    for (let i = 0; i < stockTable.length; i++) {
      await common_function.calculatePrice(stockTable[i]);
    }
    return res.render("print/inventory", {
      stockTable: stockTable,
      layout: false
    });
  } catch (err) {
    console.log("Error in List Master Page!", err);
    req.flash("error", "Error in List Master Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

module.exports.printEstimateRetail = async function (req, res) {
  try {
    return res.render("cart/print_estimate_retail", {
      billdata: JSON.parse(req.body.billdata),
      goldrate: req.body.goldrate,
      layout: false
    });
  } catch (err) {
    console.log("Error in List Master Page!", err);
    req.flash("error", "Error in List Master Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

module.exports.printEstimateWholesale = async function (req, res) {
  try {
    return res.render("cart/print_estimate_wholesale", {
      billdata: JSON.parse(req.body.billdata),
      goldrate: req.body.goldrate,
      layout: false
    });
  } catch (err) {
    console.log("Error in List Master Page!", err);
    req.flash("error", "Error in List Master Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

const axios = require("axios");
const Approval = require("../models/approval");
const Bill = require("../models/bill");
const Customer = require("../models/customer");
const Env_Variable = require("../models/env_variable");
const Index = require("../models/index");
const Ornament = require("../models/list_master/ornament");
const Prefix = require("../models/list_master/prefix");
const Purity = require("../models/list_master/purity");
const StoneType = require("../models/list_master/stonetype");
const Stock = require("../models/stock");
const User = require("../models/user");
const common_function = require("./common_function");
const breadcrumb = require("../config/breadcrumbs");

module.exports.approvalAddPage = async function (req, res) {
  try {
    let user = await User.findById(req.user);
    let stockTable = user.cart;
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
    stockTable = stockTable.filter((item) => item.isInStock);
    let customerTable = await Customer.find().sort({
      name: 1
    });
    for (let i = 0; i < customerTable.length; i++) {
      customerTable[i].searchStr =
        customerTable[i].name +
        " " +
        customerTable[i].phNum.join(" ") +
        " " +
        customerTable[i].address +
        " " +
        customerTable[i].CO.join(" ");
    }
    let totalCash = 0;
    for (let i of stockTable) {
      await common_function.calculatePrice(i);
      totalCash += i.sellingPrice;
    }
    return res.render("approval/add", {
      title: "Approval",
      activeNav: "inventory",
      stockTable,
      customerTable,
      totalCash,
      breadcrumbs: breadcrumb.trail([
        { label: "Cart", href: "/cart" },
        { label: "Approval" }
      ])
    });
  } catch (err) {
    console.log("Error in Approval Add Page!", err);
    req.flash("error", "Error in Approval Add Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.approvalAddForm = async function (req, res) {
  try {
    let user = await User.findById(req.user).populate("cart");
    let stockTable = user.cart;
    stockTable = stockTable.filter((item) => item.isInStock);
    let cart = [];
    for (let i of stockTable) {
      cart.push(i.id);
    }
    if (!cart.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    let approval = await Approval.create({
      userGave: req.user.id,
      customer: req.body.customer,
      totalCash: req.body.totalCash,
      remark: req.body.remark,
      approvedDate: new Date(),
      cart
    });
    for (let i of stockTable) {
      i.isInStock = false;
      i.approveTable.push(approval.id);
      await i.save();
    }
    let customer = await Customer.findById(req.body.customer);
    customer.approvals.push(approval.id);
    await customer.save();
    req.flash("success", "Added Approval Successfully!");
    return res.redirect("/approvalRecvPage?id=" + approval.id);
  } catch (err) {
    console.log("Error in Adding Approval!", err);
    req.flash("error", "Error in Adding Approval!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.approvalViewPage = async function (req, res) {
  try {
    let approvalTable = await Approval.find()
      .populate("userGave userTake customer")
      .sort({
        userTake: 1,
        approvedDate: -1
      });
    return res.render("approval/view", {
      title: "Approval List",
      approvalTable,
      breadcrumbLabel: "Approval List"
    });
  } catch (err) {
    console.log("Error in Approval View Page!", err);
    req.flash("error", "Error in Approval View Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.approvalRecvPage = async function (req, res) {
  try {
    let approval = await Approval.findById(req.query.id).populate(
      "userGave userTake customer"
    );
    let stockTable = approval.cart;
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
    return res.render("approval/recieved", {
      title: "View Approval",
      approval,
      stockTable,
      breadcrumbs: breadcrumb.trail([
        { label: "Approval List", href: "/approvalViewPage" },
        { label: "View Approval" }
      ]),
      convertDate: common_function.convertDate,
    });
  } catch (err) {
    console.log("Error in Approval Receive Page!", err);
    req.flash("error", "Error in Approval Receive Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.approvalRecvForm = async function (req, res) {
  try {
    let approval = await Approval.findById(req.body.approval).populate("cart");
    approval.receivedDate = new Date();
    approval.userTake = req.user.id;
    await approval.save();
    let stockTable = approval.cart;
    for (let i of stockTable) {
      i.isInStock = true;
      await i.save();
    }
    let customer = await Customer.findById(approval.customer);
    customer.approvals = customer.approvals.filter((obj) => obj != approval.id);
    await customer.save();
    let user = await User.findById(req.user.id);
    user.cart = approval.cart;
    await user.save();
    req.flash("success", "Approval Received Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Receiving Approval!", err);
    req.flash("error", "Error in Receiving Approval!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

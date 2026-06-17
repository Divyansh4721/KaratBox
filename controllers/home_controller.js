const Approval = require("../models/approval");
const Bill = require("../models/bill");
const Customer = require("../models/customer");
const Env_Variable = require("../models/env_variable");
const Index = require("../models/index");
const Ornament = require("../models/list_ornament");
const Prefix = require("../models/list_prefix");
const Purity = require("../models/list_purity");
const StoneType = require("../models/list_stonetype");
const Stock = require("../models/stock");
const User = require("../models/user");
const common_function = require("../controllers/common_function");
module.exports.homePage = async function (req, res) {
  try {
    let goldPrice = await Env_Variable.findOne({
      name: "goldPrice"
    });
    return res.render("_home", {
      title: (await common_function.AppName()) + " | Home",
      goldPrice
    });
  } catch (err) {
    console.log("Error in Home Page!", err);
    req.flash("error", "Error in Home Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.updateGoldPriceForm = async function (req, res) {
  try {
    let goldPrice = await Env_Variable.findOne({
      name: "goldPrice"
    });
    goldPrice.value = (req.body.amount * 1).toFixed(0);
    await goldPrice.save();
    req.flash("success", "Gold Rate Updated Successfully!");
    return res.redirect("/");
  } catch (err) {
    console.log("Error in Home Page!", err);
    req.flash("error", "Error in Home Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.cartPage = async function (req, res) {
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
    for (let i = 0; i < stockTable.length; i++) {
      await common_function.calculatePrice(stockTable[i]);
    }
    return res.render("cart", {
      title: (await common_function.AppName()) + " | Cart",
      stockTable
    });
  } catch (err) {
    console.log("Error in Cart Page!", err);
    req.flash("error", "Error in Cart Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addToCart = async function (req, res) {
  try {
    let stock = {};
    if (req.query.index) {
      stock = await Stock.findById(req.query.index);
    } else if (req.query.item) {
      stock = await Stock.findOne({
        index: req.query.item
      });
    } else {
      stock = await Stock.findOne({
        prefix: req.query.prefix,
        ornament: req.query.ornament,
        tag: req.query.tag
      });
    }
    let user = await User.findById(req.user);
    user.cart.push(stock.id);
    let { ObjectId } = require("mongodb");
    user.cart = Array.from(
      new Set(user.cart.map((item) => item.toString()))
    ).map((id) => new ObjectId(id));
    await user.save();
    if (req.xhr) {
      return res.status(200).json({
        status: "success",
        message: "Added To Cart Successfully!"
      });
    }
    req.flash("success", "Added To Cart Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding to Cart!", err);
    req.flash("error", "Error in Adding to Cart!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delFromCart = async function (req, res) {
  try {
    let stock = await Stock.findById(req.params.id);
    let user = await User.findById(req.user);
    user.cart.pull(stock.id);
    await user.save();
    req.flash("success", "Deleted From Cart Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting from Cart!", err);
    req.flash("error", "Error in Deleting from Cart!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.clearCart = async function (req, res) {
  try {
    let stock = await Stock.findById(req.params.id);
    let user = await User.findById(req.user);
    user.cart = [];
    await user.save();
    req.flash("success", "Cart Cleared Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Clearing Cart!", err);
    req.flash("error", "Error in Clearing Cart!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.estimateRetailPage = async function (req, res) {
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
    let ornamentTable = await Ornament.find().sort({
      name: 1
    });
    let prefixTable = await Prefix.find().sort({
      name: 1
    });
    let purityTable = await Purity.find().sort({
      name: 1
    });
    let stoneTypeTable = await StoneType.find().sort({
      name: 1
    });
    let goldPrice = await Env_Variable.findOne({
      name: "goldPrice"
    });
    return res.render("estimateRetail", {
      title: (await common_function.AppName()) + " | Estimate Retail",
      stockTable,
      ornamentTable,
      prefixTable,
      purityTable,
      stoneTypeTable,
      goldPrice: goldPrice.value
    });
  } catch (err) {
    console.log("Error in Estimate Page!", err);
    req.flash("error", "Error in Estimate Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.estimateWholesalePage = async function (req, res) {
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
    let ornamentTable = await Ornament.find().sort({
      name: 1
    });
    let prefixTable = await Prefix.find().sort({
      name: 1
    });
    let purityTable = await Purity.find().sort({
      name: 1
    });
    let stoneTypeTable = await StoneType.find().sort({
      name: 1
    });
    let goldPrice = await Env_Variable.findOne({
      name: "goldPrice"
    });
    return res.render("estimateWholesale", {
      title: (await common_function.AppName()) + " | Estimate Wholesale",
      stockTable,
      ornamentTable,
      billTable: [],
      prefixTable,
      purityTable,
      stoneTypeTable,
      goldPrice: goldPrice.value
    });
  } catch (err) {
    console.log("Error in Estimate Page!", err);
    req.flash("error", "Error in Estimate Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.estimateWholesaleBillPage = async function (req, res) {
  try {
    let bill = await Bill.findById(req.params.id);
    let stockTable = bill.cart;
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
    let ornamentTable = await Ornament.find().sort({
      name: 1
    });
    let prefixTable = await Prefix.find().sort({
      name: 1
    });
    let purityTable = await Purity.find().sort({
      name: 1
    });
    let stoneTypeTable = await StoneType.find().sort({
      name: 1
    });
    let goldPrice = await Env_Variable.findOne({
      name: "goldPrice"
    });
    return res.render("estimateWholesale", {
      title: (await common_function.AppName()) + " | Estimate Wholesale",
      stockTable,
      ornamentTable,
      billTable: bill.stoneTable,
      prefixTable,
      purityTable,
      stoneTypeTable,
      goldPrice: bill.goldRate
    });
  } catch (err) {
    console.log("Error in Estimate Page!", err);
    req.flash("error", "Error in Estimate Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.soldRetailPage = async function (req, res) {
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
        ornament: 1
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
    let tTotalPrice = 0;
    for (let i = 0; i < stockTable.length; i++) {
      await common_function.calculatePrice(stockTable[i]);
      tTotalPrice += stockTable[i].sellingPrice;
    }
    return res.render("soldRetail", {
      title: (await common_function.AppName()) + " | Sell Retail",
      stockTable,
      customerTable,
      tTotalPrice
    });
  } catch (err) {
    console.log("Error in Stock Selling Page!", err);
    req.flash("error", "Error in Stock Selling Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.soldRetailForm = async function (req, res) {
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
        ornament: 1
      });
    stockTable = stockTable.filter((item) => item.isInStock);
    let cart = [];
    for (let i of stockTable) {
      cart.push(i.id);
    }
    if (!cart.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.body.amount = req.body.amount ? req.body.amount : 0;
    for (let i = 0; i < stockTable.length; i++) {
      stockTable[i].isInStock = false;
      stockTable[i].tag = "";
      stockTable[i].SKU = "";
      await stockTable[i].save();
      let index = await Index.findOne({
        prefix: stockTable[i].prefix.id,
        ornament: stockTable[i].ornament.id
      });
      index.available = index.available.filter(
        (obj) => obj != stockTable[i].tag
      );
      await index.save();
    }
    if (!req.body.customer) {
      let bill = await Bill.create({
        amount: req.body.amount,
        user: user.id,
        cart
      });
      for (let i = 0; i < stockTable.length; i++) {
        stockTable[i].bill = bill.id;
        await stockTable[i].save();
      }
    } else {
      let customer = await Customer.findById(req.body.customer);
      let bill = await Bill.create({
        customer: customer.id,
        amount: req.body.amount,
        user: user.id,
        cart
      });
      customer.bills.push(bill.id);
      await customer.save();
      for (let i = 0; i < stockTable.length; i++) {
        stockTable[i].bill = bill.id;
        await stockTable[i].save();
      }
    }
    return res.redirect("/cart");
  } catch (err) {
    console.log("Error in Selling Stock!", err);
    req.flash("error", "Error in Selling Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.soldWholesalePage = async function (req, res) {
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
        ornament: 1
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
    let goldPrice = await Env_Variable.findOne({
      name: "goldPrice"
    });
    return res.render("soldWholesale", {
      title: (await common_function.AppName()) + " | Sell Wholesale",
      stockTable,
      customerTable,
      goldPrice: goldPrice.value
    });
  } catch (err) {
    console.log("Error in Stock Selling Page!", err);
    req.flash("error", "Error in Stock Selling Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.soldWholesaleForm = async function (req, res) {
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
        ornament: 1
      });
    stockTable = stockTable.filter((item) => item.isInStock);
    let cart = [];
    for (let i of stockTable) {
      cart.push(i.id);
    }
    if (!cart.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    for (let i = 0; i < stockTable.length; i++) {
      stockTable[i].isInStock = false;
      stockTable[i].tag = "";
      stockTable[i].SKU = "";
      await stockTable[i].save();
      let index = await Index.findOne({
        prefix: stockTable[i].prefix,
        ornament: stockTable[i].ornament
      });
      index.available = index.available.filter(
        (obj) => obj != stockTable[i].tag
      );
      await index.save();
    }
    let customer = await Customer.findById(req.body.customer);
    let bill = await Bill.create({
      customer: customer.id,
      totalWt: req.body.totalWt,
      goldRate: req.body.goldRate,
      totalCash: req.body.totalCash,
      user: user.id,
      stoneTable: JSON.parse(req.body.stoneTable),
      cart
    });
    customer.bills.push(bill.id);
    await customer.save();
    for (let i = 0; i < stockTable.length; i++) {
      stockTable[i].bill = bill.id;
      await stockTable[i].save();
    }
    return res.redirect("/cart");
  } catch (err) {
    console.log("Error in Selling Stock!", err);
    req.flash("error", "Error in Selling Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.billPage = async function (req, res) {
  try {
    let billTable = await Bill.find({
      customer: {
        $exists: true
      }
    })
      .populate("customer user")
      .sort({
        createdAt: -1
      });
    return res.render("billForm", {
      title: (await common_function.AppName()) + " | View Bill",
      billTable
    });
  } catch (err) {
    console.log("Error in Bill List Page!", err);
    req.flash("error", "Error in Bill List Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.billView = async function (req, res) {
  try {
    let bill = await Bill.findById(req.query.id).populate("customer user");
    let stockTable = bill.cart;
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
    return res.render("bill", {
      title: (await common_function.AppName()) + " | Bill",
      bill,
      stockTable,
      convertDate: common_function.convertDate
    });
  } catch (err) {
    console.log("Error in Viewing Bill Page!", err);
    req.flash("error", "Error in Viewing Bill Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
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
    return res.render("approval_add", {
      title: (await common_function.AppName()) + " | Add Approval",
      stockTable,
      customerTable,
      totalCash
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
    return res.render("approval_view", {
      title: (await common_function.AppName()) + " | Approval List",
      approvalTable
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
    return res.render("approval_recv", {
      title: (await common_function.AppName()) + " | View Approval",
      approval,
      stockTable
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

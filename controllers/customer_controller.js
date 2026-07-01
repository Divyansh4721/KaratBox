const Bill = require("../models/bill");
const Customer = require("../models/customer");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
async function checkPhoneNumber(InputPhoneList, InputID) {
  let CheckList = [];
  let customers = await Customer.find();
  for (let item of customers)
    for (let eachNum of item.phNum)
      CheckList.push({
        id: item.id,
        phNum: eachNum
      });
  for (let eachNum of InputPhoneList) {
    let temp = CheckList.find((item) => Number(item.phNum) === Number(eachNum));
    if (temp) {
      if (temp.id === InputID) continue;
      return temp.id;
    }
  }
  return false;
}
module.exports.CustomerPage = async function (req, res) {
  try {
    let customer = await Customer.findById(req.query.id)
      .populate("user", "email name")
      .populate({
        path: "bills",
        populate: [
          { path: "user", select: "email name" },
          {
            path: "cart",
            populate: "prefix ornament purity stockType stoneTable.type"
          }
        ]
      })
      .populate({
        path: "approvals",
        populate: [
          {
            path: "cart",
            populate: "prefix ornament purity stockType stoneTable.type"
          }
        ]
      })
      .populate({
        path: "payments",
        populate: [{ path: "user", select: "email name" }]
      });
    let cashBalance = 0;
    let goldBalance = 0;
    let entries = [];
    for (let i of customer.bills) {
      if (i.totalCash) {
        entries.push({
          id: i.id,
          user: i.user,
          bill: "bill",
          type: "left",
          amount: i.totalCash,
          gold: i.goldRate ? 0 : i.totalWt,
          date: i.createdAt
        });
        cashBalance -= i.totalCash * 1;
        goldBalance -= (i.goldRate ? 0 : i.totalWt) * 1;
      } else {
        entries.push({
          id: i.id,
          user: i.user,
          bill: "bill",
          type: "left",
          amount: i.amount,
          gold: 0,
          date: i.createdAt
        });
        cashBalance -= i.amount * 1;
      }
    }
    for (let i of customer.approvals) {
      entries.push({
        id: i.id,
        user: i.user,
        bill: "approval",
        type: "middle",
        amount: i.totalCash,
        date: i.approvedDate
      });
    }
    for (let i of customer.payments) {
      if (i.amount) {
        entries.push({
          id: i.id,
          user: i.user,
          bill: "",
          type: i.amount > 0 ? "right" : "left",
          amount: Math.abs(i.amount),
          date: i.date,
          remark: i.remark
        });
        cashBalance += i.amount * 1;
      } else {
        entries.push({
          id: i.id,
          user: i.user,
          bill: "",
          type: i.gold > 0 ? "right" : "left",
          amount: 0,
          gold: Math.abs(i.gold),
          date: i.date,
          remark: i.remark
        });
        goldBalance += (i.gold ? i.gold : 0) * 1;
      }
    }
    entries.sort((a, b) => a.date - b.date);
    return res.render("customer/customer_view", {
      title: "Customer",
      customer,
      entries,
      cashBalance,
      goldBalance,
      convertDate: common_function.convertDate,
      breadcrumbs: breadcrumb.trail([
        { label: "Customer Management", href: "/customerTable" },
        { label: customer.name }
      ])
    });
  } catch (err) {
    console.log("Error in Customer Page!", err);
    req.flash("error", "Error in Customer Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.CustomerPageForm = async function (req, res) {
  try {
    let customerTable = await Customer.find().sort({ name: 1 });
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
    return res.render("customer_form", {
      title: "Customer",
      customerTable
    });
  } catch (err) {
    console.log("Error in Customer View Page!", err);
    req.flash("error", "Error in Customer View Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.CustomerPageTable = async function (req, res) {
  try {
    let customerTable = await Customer.find()
      .populate("user", "email name")
      .sort({ createdAt: -1 });
    return res.render("customer/customer_table", {
      title: "Customer",
      customerTable,
      convertDate: common_function.convertDate,
      breadcrumbLabel: "Customer Management"
    });
  } catch (err) {
    console.log("Error in Customer View Page!", err);
    req.flash("error", "Error in Customer View Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addCustomerApi = async function (req, res) {
  try {
    if (!req.body.phNum || !req.body.phNum.length) {
      return res.status(400).json({ success: false, message: "Phone Number not Added!" });
    }
    let check = await checkPhoneNumber(req.body.phNum, "");
    if (check) {
      return res.status(409).json({
        success: false,
        message: "Phone Number already Exists!",
        customerId: check
      });
    }
    let impDates = [];
    for (let i = 0; req.body.impDates && i < req.body.impDates.length; i++) {
      impDates.push({
        date: req.body.impDates[i],
        remark: req.body.remark[i].replace(/[^a-zA-Z0-9 ]/g, " ")
      });
    }
    for (let i = 0; req.body.CO && i < req.body.CO.length; i++) {
      req.body.CO[i] = req.body.CO[i].replace(/[^a-zA-Z0-9 ]/g, " ");
    }
    req.body.phNum = Array.from(new Set(req.body.phNum));
    let customer = await Customer.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " "),
      address: req.body.address.replace(/[^a-zA-Z0-9 ]/g, " "),
      phNum: req.body.phNum,
      CO: req.body.CO,
      impDates: impDates,
      user: req.user.id,
      bills: [],
      payments: [],
      approvals: []
    });
    return res.status(201).json({
      success: true,
      message: "Added Customer Successfully!",
      data: customer
    });
  } catch (err) {
    console.log("Error in Adding Customer API!", err);
    return res.status(500).json({ success: false, message: "Error in Adding Customer!" });
  }
};
module.exports.editCustomerApi = async function (req, res) {
  try {
    if (!req.body.phNum || !req.body.phNum.length) {
      return res.status(400).json({ success: false, message: "Phone Number not Added!" });
    }
    let customer = await Customer.findById(req.body.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found!" });
    }
    let check = await checkPhoneNumber(req.body.phNum, req.body.id);
    if (check) {
      return res.status(409).json({ success: false, message: "Phone Number already Exists!" });
    }
    let impDates = [];
    for (let i = 0; req.body.impDates && i < req.body.impDates.length; i++) {
      impDates.push({
        date: req.body.impDates[i],
        remark: req.body.remark[i].replace(/[^a-zA-Z0-9 ]/g, " ")
      });
    }
    for (let i = 0; req.body.CO && i < req.body.CO.length; i++) {
      req.body.CO[i] = req.body.CO[i].replace(/[^a-zA-Z0-9 ]/g, " ");
    }
    req.body.phNum = Array.from(new Set(req.body.phNum));
    customer.name = req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ");
    customer.address = req.body.address.replace(/[^a-zA-Z0-9 ]/g, " ");
    customer.phNum = req.body.phNum;
    customer.CO = req.body.CO;
    customer.impDates = impDates;
    customer.user = req.user.id;
    await customer.save();
    return res.status(200).json({
      success: true,
      message: "Edited Customer Successfully!",
      data: customer
    });
  } catch (err) {
    console.log("Error in Editing Customer API!", err);
    return res.status(500).json({ success: false, message: "Error in Editing Customer!" });
  }
};
module.exports.addPaymentCustomerApi = async function (req, res) {
  try {
    let customer = await Customer.findById(req.body.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found!" });
    }
    if (req.body.amount) {
      customer.payments.push({
        user: req.user.id,
        amount: req.body.amount,
        date: req.body.date,
        remark: req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ")
      });
    } else {
      customer.payments.push({
        user: req.user.id,
        gold: req.body.gold,
        date: req.body.date
      });
    }
    await customer.save();
    return res.status(200).json({ success: true, message: "Added Payment Successfully!" });
  } catch (err) {
    console.log("Error in Adding Customer Payment API!", err);
    return res.status(500).json({ success: false, message: "Error in Adding Customer Payment!" });
  }
};
module.exports.delPaymentCustomerApi = async function (req, res) {
  try {
    let customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found!" });
    }
    customer.payments = customer.payments.filter(
      (obj) => obj.id != req.body.paymentId
    );
    await customer.save();
    return res.status(200).json({ success: true, message: "Deleted Payment Successfully!" });
  } catch (err) {
    console.log("Error in Deleting Customer Payment API!", err);
    return res.status(500).json({ success: false, message: "Error in Deleting Customer Payment!" });
  }
};
module.exports.delBillCustomerApi = async function (req, res) {
  try {
    let bill = await Bill.findById(req.body.billId);
    if (bill) {
      bill.customer = undefined;
      await bill.save();
    }
    let customer = await Customer.findById(req.body.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found!" });
    }
    customer.bills = customer.bills.filter((obj) => obj != req.body.billId);
    await customer.save();
    return res.status(200).json({ success: true, message: "Deleted Bill Successfully!" });
  } catch (err) {
    console.log("Error in Deleting Customer Bill API!", err);
    return res.status(500).json({ success: false, message: "Error in Deleting Customer Bill!" });
  }
};
module.exports.delCustomerApi = async function (req, res) {
  try {
    let customer = await Customer.findById(req.body.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found!" });
    }
    if (
      customer.bills.length ||
      customer.approvals.length ||
      customer.payments.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer has bills, approvals, or payments. Settle first."
      });
    }
    await Customer.findByIdAndDelete(req.body.id);
    return res.status(200).json({ success: true, message: "Deleted Customer Successfully!" });
  } catch (err) {
    console.log("Error in Deleting Customer API!", err);
    return res.status(500).json({ success: false, message: "Error in Deleting Customer!" });
  }
};
module.exports.settleCustomerApi = async function (req, res) {
  try {
    let customer = await Customer.findById(req.body.id).populate("bills");
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found!" });
    }
    for (let eachBill of customer.bills) {
      eachBill.customer = undefined;
      await eachBill.save();
    }
    customer.bills = [];
    customer.payments = [];
    await customer.save();
    return res.status(200).json({ success: true, message: "Customer Settled Successfully!" });
  } catch (err) {
    console.log("Error in Settling Customer API!", err);
    return res.status(500).json({ success: false, message: "Error in Settling Customer!" });
  }
};

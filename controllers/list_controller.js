const Index = require("../models/index");
const Kaarigar = require("../models/list_master/kaarigar");
const Ornament = require("../models/list_master/ornament");
const Prefix = require("../models/list_master/prefix");
const Purity = require("../models/list_master/purity");
const StockType = require("../models/list_master/stocktype");
const StoneDealer = require("../models/list_master/stonedealer");
const StoneType = require("../models/list_master/stonetype");
const Stock = require("../models/stock");
const Env_Variable = require("../models/env_variable");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
module.exports.listMasterPage = async function (req, res) {
  try {
    let TagName = await Env_Variable.findOne({ name: "TagName" });
    let goldPrice = await Env_Variable.findOne({ name: "goldPrice" });
    return res.render("list_master", {
      title: "List Master",
      activeNav: "list_master",
      TagName: TagName || { value: "" },
      goldPrice: goldPrice || { value: "0" },
      ...breadcrumb.label("List Master")
    });
  } catch (err) {
    console.log("Error in List Master Page!", err);
    req.flash("error", "Error in List Master Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.updateTagNameFormApi = async function (req, res) {
  try {
    let TagName = await Env_Variable.findOne({ name: "TagName" });
    TagName.value = req.body.TagName;
    await TagName.save();
    return res.status(200).json({
      success: true,
      message: "Gold Rate Updated Successfully!"
    });
  } catch (err) {
    console.log("Error in Updating Tag Name API!", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error while updating Gold Rate."
    });
  }
};
module.exports.kaarigarPage = async function (req, res) {
  try {
    let kaarigar = await Kaarigar.find().sort({ name: 1 });
    kaarigar = JSON.parse(JSON.stringify(kaarigar));
    for (let i = 0; i < kaarigar.length; i++) {
      let stock = await Stock.find({ kaarigar: kaarigar[i]._id });
      kaarigar[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_kaarigar", {
      title: "Kaarigar",
      activeNav: "list_master",
      name: "Kaarigar",
      options: kaarigar,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "Kaarigar" }
      ])
    });
  } catch (err) {
    console.log("Error in Kaarigar Page!", err);
    req.flash("error", "Error in Kaarigar Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addKaarigarApi = async function (req, res) {
  try {
    const newKaarigar = await Kaarigar.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.status(201).json({
      success: true,
      message: "Kaarigar added successfully!",
      data: newKaarigar
    });
  } catch (err) {
    console.log("Error in Adding Kaarigar API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding Kaarigar!"
    });
  }
};
module.exports.editKaarigarApi = async function (req, res) {
  try {
    let temp = await Kaarigar.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Kaarigar not found!" });
    }
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Kaarigar updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing Kaarigar API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing Kaarigar!"
    });
  }
};
module.exports.delKaarigarApi = async function (req, res) {
  try {
    let temp = await Stock.find({ kaarigar: req.body.name });
    if (!temp.length) {
      await Kaarigar.findByIdAndDelete(req.body.name);
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting Kaarigar API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting Kaarigar!"
    });
  }
};
module.exports.ornamentPage = async function (req, res) {
  try {
    let ornament = await Ornament.find().sort({ name: 1 });
    ornament = JSON.parse(JSON.stringify(ornament));
    for (let i = 0; i < ornament.length; i++) {
      let stock = await Stock.find({ ornament: ornament[i]._id });
      ornament[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_ornament", {
      title: "Ornament",
      activeNav: "list_master",
      name: "Ornament",
      options: ornament,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "Ornament" }
      ])
    });
  } catch (err) {
    console.log("Error in Ornament Page!", err);
    req.flash("error", "Error in Ornament Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addOrnamentApi = async function (req, res) {
  try {
    let ornament = await Ornament.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    let prefix = await Prefix.find();
    for (let i = 0; i < prefix.length; i++) {
      await Index.create({
        prefix: prefix[i],
        ornament,
        available: []
      });
    }
    return res.status(201).json({
      success: true,
      message: "Ornament and corresponding indexes added successfully!",
      data: ornament
    });
  } catch (err) {
    console.log("Error in Adding Ornament API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding Ornament!"
    });
  }
};
module.exports.editOrnamentApi = async function (req, res) {
  try {
    let temp = await Ornament.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Ornament not found!" });
    }
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Ornament updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing Ornament API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing Ornament!"
    });
  }
};
module.exports.delOrnamentApi = async function (req, res) {
  try {
    let temp = await Stock.find({ ornament: req.body.name });
    if (!temp.length) {
      await Ornament.findByIdAndDelete(req.body.name);
      await Index.deleteMany({ ornament: req.body.name });
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting Ornament API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting Ornament!"
    });
  }
};
module.exports.prefixPage = async function (req, res) {
  try {
    let prefix = await Prefix.find().sort({ name: 1 });
    prefix = JSON.parse(JSON.stringify(prefix));
    for (let i = 0; i < prefix.length; i++) {
      let stock = await Stock.find({ prefix: prefix[i]._id });
      prefix[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_prefix", {
      title: "Prefix",
      activeNav: "list_master",
      name: "Prefix",
      options: prefix,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "Prefix" }
      ])
    });
  } catch (err) {
    console.log("Error in Prefix Page!", err);
    req.flash("error", "Error in Prefix Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addPrefixApi = async function (req, res) {
  try {
    let prefix = await Prefix.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    let ornament = await Ornament.find();
    for (let i = 0; i < ornament.length; i++) {
      await Index.create({
        prefix,
        ornament: ornament[i],
        available: []
      });
    }
    return res.status(201).json({
      success: true,
      message: "Prefix and corresponding indexes added successfully!",
      data: prefix
    });
  } catch (err) {
    console.log("Error in Adding Prefix API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding Prefix!"
    });
  }
};
module.exports.editPrefixApi = async function (req, res) {
  try {
    let temp = await Prefix.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Prefix not found!" });
    }
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Prefix updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing Prefix API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing Prefix!"
    });
  }
};
module.exports.delPrefixApi = async function (req, res) {
  try {
    let temp = await Stock.find({ prefix: req.body.name });
    if (!temp.length) {
      await Prefix.findByIdAndDelete(req.body.name);
      await Index.deleteMany({ prefix: req.body.name });
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting Prefix API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting Prefix!"
    });
  }
};
module.exports.purityPage = async function (req, res) {
  try {
    let purity = await Purity.find().sort({ name: 1 });
    purity = JSON.parse(JSON.stringify(purity));
    for (let i = 0; i < purity.length; i++) {
      let stock = await Stock.find({ purity: purity[i]._id });
      purity[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_purity", {
      title: "Purity",
      activeNav: "list_master",
      name: "Purity",
      options: purity,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "Purity" }
      ])
    });
  } catch (err) {
    console.log("Error in Purity Page!", err);
    req.flash("error", "Error in Purity Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addPurityApi = async function (req, res) {
  try {
    const newPurity = await Purity.create({
      name: req.body.name,
      wholesaleMultiplier: req.body.wholesaleMultiplier,
      retailMultiplier: req.body.retailMultiplier,
      wastage: req.body.wastage
    });
    return res.status(201).json({
      success: true,
      message: "Purity added successfully!",
      data: newPurity
    });
  } catch (err) {
    console.log("Error in Adding Purity API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding Purity!"
    });
  }
};
module.exports.editPurityApi = async function (req, res) {
  try {
    let temp = await Purity.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Purity not found!" });
    }
    temp.name = req.body.newname;
    temp.wholesaleMultiplier = req.body.wholesaleMultiplier;
    temp.retailMultiplier = req.body.retailMultiplier;
    temp.wastage = req.body.wastage;
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Purity updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing Purity API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing Purity!"
    });
  }
};
module.exports.delPurityApi = async function (req, res) {
  try {
    let temp = await Stock.find({ purity: req.body.name });
    if (!temp.length) {
      await Purity.findByIdAndDelete(req.body.name);
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting Purity API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting Purity!"
    });
  }
};
module.exports.stockTypePage = async function (req, res) {
  try {
    let stockType = await StockType.find().sort({ name: 1 });
    stockType = JSON.parse(JSON.stringify(stockType));
    for (let i = 0; i < stockType.length; i++) {
      let stock = await Stock.find({ stockType: stockType[i]._id });
      stockType[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_stocktype", {
      title: "StockType",
      activeNav: "list_master",
      name: "StockType",
      options: stockType,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "StockType" }
      ])
    });
  } catch (err) {
    console.log("Error in StockType Page!", err);
    req.flash("error", "Error in StockType Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStockTypeApi = async function (req, res) {
  try {
    const newStockType = await StockType.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.status(201).json({
      success: true,
      message: "Stock Type added successfully!",
      data: newStockType
    });
  } catch (err) {
    console.log("Error in Adding StockType API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding StockType!"
    });
  }
};
module.exports.editStockTypeApi = async function (req, res) {
  try {
    let temp = await StockType.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Stock Type not found!" });
    }
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Stock Type updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing StockType API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing StockType!"
    });
  }
};
module.exports.delStockTypeApi = async function (req, res) {
  try {
    let temp = await Stock.find({ stockType: req.body.name });
    if (!temp.length) {
      await StockType.findByIdAndDelete(req.body.name);
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting StockType API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting StockType!"
    });
  }
};
module.exports.stoneDealerPage = async function (req, res) {
  try {
    let stoneDealer = await StoneDealer.find().sort({ name: 1 });
    stoneDealer = JSON.parse(JSON.stringify(stoneDealer));
    for (let i = 0; i < stoneDealer.length; i++) {
      let stock = await Stock.find({
        "stoneTable.dealerName": stoneDealer[i]._id
      });
      stoneDealer[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_stonedealer", {
      title: "StoneDealer",
      activeNav: "list_master",
      name: "StoneDealer",
      options: stoneDealer,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "StoneDealer" }
      ])
    });
  } catch (err) {
    console.log("Error in StoneDealer Page!", err);
    req.flash("error", "Error in StoneDealer Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStoneDealerApi = async function (req, res) {
  try {
    const newDealer = await StoneDealer.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.status(201).json({
      success: true,
      message: "Stone Dealer added successfully!",
      data: newDealer
    });
  } catch (err) {
    console.log("Error in Adding StoneDealer API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding StoneDealer!"
    });
  }
};
module.exports.editStoneDealerApi = async function (req, res) {
  try {
    let temp = await StoneDealer.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Stone Dealer not found!" });
    }
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Stone Dealer updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing StoneDealer API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing StoneDealer!"
    });
  }
};
module.exports.delStoneDealerApi = async function (req, res) {
  try {
    let temp = await Stock.find({ "stoneTable.dealerName": req.body.name });
    if (!temp.length) {
      await StoneDealer.findByIdAndDelete(req.body.name);
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting StoneDealer API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting StoneDealer!"
    });
  }
};
module.exports.stoneTypePage = async function (req, res) {
  try {
    let stoneType = await StoneType.find().sort({ name: 1 });
    stoneType = JSON.parse(JSON.stringify(stoneType));
    for (let i = 0; i < stoneType.length; i++) {
      let stock = await Stock.find({ "stoneTable.type": stoneType[i]._id });
      stoneType[i].stockCount = stock.length;
    }
    return res.render("list_master/edit_add_del_stonetype", {
      title: "StoneType",
      activeNav: "list_master",
      name: "StoneType",
      options: stoneType,
      breadcrumbs: breadcrumb.trail([
        { label: "List Master", href: "/list_master" },
        { label: "StoneType" }
      ])
    });
  } catch (err) {
    console.log("Error in StoneType Page!", err);
    req.flash("error", "Error in StoneType Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStoneTypeApi = async function (req, res) {
  try {
    const newStoneType = await StoneType.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.status(201).json({
      success: true,
      message: "Stone Type added successfully!",
      data: newStoneType
    });
  } catch (err) {
    console.log("Error in Adding StoneType API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Adding StoneType!"
    });
  }
};
module.exports.editStoneTypeApi = async function (req, res) {
  try {
    let temp = await StoneType.findById(req.body.oldname);
    if (!temp) {
      return res
        .status(404)
        .json({ success: false, message: "Stone Type not found!" });
    }
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.status(200).json({
      success: true,
      message: "Stone Type updated successfully!",
      data: temp
    });
  } catch (err) {
    console.log("Error in Editing StoneType API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Editing StoneType!"
    });
  }
};
module.exports.delStoneTypeApi = async function (req, res) {
  try {
    let temp = await Stock.find({ "stoneTable.type": req.body.name });
    if (!temp.length) {
      await StoneType.findByIdAndDelete(req.body.name);
      return res.status(200).json({
        success: true,
        message: "Deleted Successfully!"
      });
    }
    return res.status(400).json({
      success: false,
      message: "Item in Use! Cannot delete."
    });
  } catch (err) {
    console.log("Error in Deleting StoneType API!", err);
    return res.status(500).json({
      success: false,
      message: "Error in Deleting StoneType!"
    });
  }
};

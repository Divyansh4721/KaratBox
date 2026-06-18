const Index = require("../models/index");
const Kaarigar = require("../models/list_kaarigar");
const Ornament = require("../models/list_ornament");
const Prefix = require("../models/list_prefix");
const Purity = require("../models/list_purity");
const StockType = require("../models/list_stocktype");
const StoneDealer = require("../models/list_stonedealer");
const StoneType = require("../models/list_stonetype");
const Stock = require("../models/stock");
const Env_Variable = require("../models/env_variable");
const common_function = require("../controllers/common_function");
module.exports.listMasterPage = async function (req, res) {
  try {
    let TagName = await Env_Variable.findOne({
      name: "TagName"
    });
    return res.render("_list_master", {
      title: "List Master",
      TagName
    });
  } catch (err) {
    console.log("Error in List Master Page!", err);
    req.flash("error", "Error in List Master Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.updateTagNameForm = async function (req, res) {
  try {
    let TagName = await Env_Variable.findOne({
      name: "TagName"
    });
    TagName.value = req.body.TagName;
    await TagName.save();
    req.flash("success", "Gold Rate Updated Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Home Page!", err);
    req.flash("error", "Error in Home Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.kaarigarPage = async function (req, res) {
  try {
    let kaarigar = await Kaarigar.find().sort({
      name: 1
    });
    for (let i = 0; i < kaarigar.length; i++) {
      let stock = await Stock.find({
        kaarigar: kaarigar[i].id
      });
      kaarigar[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_layout", {
      title: "Kaarigar",
      name: "Kaarigar",
      options: kaarigar
    });
  } catch (err) {
    console.log("Error in Kaarigar Page!", err);
    req.flash("error", "Error in Kaarigar Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addKaarigarPage = async function (req, res) {
  try {
    await Kaarigar.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding Kaarigar!", err);
    req.flash("error", "Error in Adding Kaarigar!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editKaarigarPage = async function (req, res) {
  try {
    let temp = await Kaarigar.findById(req.body.oldname);
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing Kaarigar!", err);
    req.flash("error", "Error in Editing Kaarigar!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delKaarigarPage = async function (req, res) {
  try {
    let temp = await Stock.find({
      kaarigar: req.body.name
    });
    if (!temp.length) {
      await Kaarigar.findByIdAndDelete(req.body.name);
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting Kaarigar!", err);
    req.flash("error", "Error in Deleting Kaarigar!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.ornamentPage = async function (req, res) {
  try {
    let ornament = await Ornament.find().sort({
      name: 1
    });
    for (let i = 0; i < ornament.length; i++) {
      let stock = await Stock.find({
        ornament: ornament[i].id
      });
      ornament[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_layout", {
      title: "Ornament",
      name: "Ornament",
      options: ornament
    });
  } catch (err) {
    console.log("Error in Ornament Page!", err);
    req.flash("error", "Error in Ornament Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addOrnamentPage = async function (req, res) {
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
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding Ornament!", err);
    req.flash("error", "Error in Adding Ornament!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editOrnamentPage = async function (req, res) {
  try {
    let temp = await Ornament.findById(req.body.oldname);
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing Ornament!", err);
    req.flash("error", "Error in Editing Ornament!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delOrnamentPage = async function (req, res) {
  try {
    let temp = await Stock.find({
      ornament: req.body.name
    });
    if (!temp.length) {
      await Ornament.findByIdAndDelete(req.body.name);
      await Index.deleteMany({
        ornament: req.body.name
      });
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting Ornament!", err);
    req.flash("error", "Error in Deleting Ornament!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.prefixPage = async function (req, res) {
  try {
    let prefix = await Prefix.find().sort({
      name: 1
    });
    for (let i = 0; i < prefix.length; i++) {
      let stock = await Stock.find({
        prefix: prefix[i].id
      });
      prefix[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_layout", {
      title: "Prefix",
      name: "Prefix",
      options: prefix
    });
  } catch (err) {
    console.log("Error in Prefix Page!", err);
    req.flash("error", "Error in Prefix Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addPrefixPage = async function (req, res) {
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
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding Prefix!", err);
    req.flash("error", "Error in Adding Prefix!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editPrefixPage = async function (req, res) {
  try {
    let temp = await Prefix.findById(req.body.oldname);
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing Prefix!", err);
    req.flash("error", "Error in Editing Prefix!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delPrefixPage = async function (req, res) {
  try {
    let temp = await Stock.find({
      prefix: req.body.name
    });
    if (!temp.length) {
      await Prefix.findByIdAndDelete(req.body.name);
      await Index.deleteMany({
        prefix: req.body.name
      });
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting Prefix!", err);
    req.flash("error", "Error in Deleting Prefix!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.purityPage = async function (req, res) {
  try {
    let purity = await Purity.find().sort({
      name: 1
    });
    for (let i = 0; i < purity.length; i++) {
      purity[i].name =
        purity[i].name +
        " | " +
        purity[i].wholesaleMultiplier +
        " | " +
        purity[i].retailMultiplier +
        " | " +
        purity[i].wastage;
      let stock = await Stock.find({
        purity: purity[i].id
      });
      purity[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_purity", {
      title: "Purity",
      name: "Purity",
      options: purity
    });
  } catch (err) {
    console.log("Error in Purity Page!", err);
    req.flash("error", "Error in Purity Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addPurityPage = async function (req, res) {
  try {
    await Purity.create({
      name: req.body.name,
      wholesaleMultiplier: req.body.wholesaleMultiplier,
      retailMultiplier: req.body.retailMultiplier,
      wastage: req.body.wastage
    });
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding Purity!", err);
    req.flash("error", "Error in Adding Purity!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editPurityPage = async function (req, res) {
  try {
    let temp = await Purity.findById(req.body.oldname);
    temp.name = req.body.newname;
    temp.wholesaleMultiplier = req.body.wholesaleMultiplier;
    temp.retailMultiplier = req.body.retailMultiplier;
    temp.wastage = req.body.wastage;
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing Purity!", err);
    req.flash("error", "Error in Editing Purity!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delPurityPage = async function (req, res) {
  try {
    let temp = await Stock.find({
      purity: req.body.name
    });
    if (!temp.length) {
      await Purity.findByIdAndDelete(req.body.name);
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting Purity!", err);
    req.flash("error", "Error in Deleting Purity!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockTypePage = async function (req, res) {
  try {
    let stockType = await StockType.find().sort({
      name: 1
    });
    for (let i = 0; i < stockType.length; i++) {
      let stock = await Stock.find({
        stockType: stockType[i].id
      });
      stockType[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_layout", {
      title: "StockType",
      name: "StockType",
      options: stockType
    });
  } catch (err) {
    console.log("Error in StockType Page!", err);
    req.flash("error", "Error in StockType Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStockTypePage = async function (req, res) {
  try {
    await StockType.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding StockType!", err);
    req.flash("error", "Error in Adding StockType!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editStockTypePage = async function (req, res) {
  try {
    let temp = await StockType.findById(req.body.oldname);
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing StockType!", err);
    req.flash("error", "Error in Editing StockType!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delStockTypePage = async function (req, res) {
  try {
    let temp = await Stock.find({
      stockType: req.body.name
    });
    if (!temp.length) {
      await StockType.findByIdAndDelete(req.body.name);
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting StockType!", err);
    req.flash("error", "Error in Deleting StockType!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stoneDealerPage = async function (req, res) {
  try {
    let stoneDealer = await StoneDealer.find().sort({
      name: 1
    });
    for (let i = 0; i < stoneDealer.length; i++) {
      let stock = await Stock.find({
        "stoneTable.dealerName": stoneDealer[i].id
      });
      stoneDealer[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_layout", {
      title: "StoneDealer",
      name: "StoneDealer",
      options: stoneDealer
    });
  } catch (err) {
    console.log("Error in StoneDealer Page!", err);
    req.flash("error", "Error in StoneDealer Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStoneDealerPage = async function (req, res) {
  try {
    await StoneDealer.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding StoneDealer!", err);
    req.flash("error", "Error in Adding StoneDealer!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editStoneDealerPage = async function (req, res) {
  try {
    let temp = await StoneDealer.findById(req.body.oldname);
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing StoneDealer!", err);
    req.flash("error", "Error in Editing StoneDealer!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delStoneDealerPage = async function (req, res) {
  try {
    let temp = await Stock.find({
      "stoneTable.dealerName": req.body.name
    });
    if (!temp.length) {
      await StoneDealer.findByIdAndDelete(req.body.name);
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting StoneDealer!", err);
    req.flash("error", "Error in Deleting StoneDealer!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stoneTypePage = async function (req, res) {
  try {
    let stoneType = await StoneType.find().sort({
      name: 1
    });
    for (let i = 0; i < stoneType.length; i++) {
      let stock = await Stock.find({
        "stoneTable.type": stoneType[i].id
      });
      stoneType[i].name += " (" + stock.length + ")";
    }
    return res.render("edit_add_del_layout", {
      title: "StoneType",
      name: "StoneType",
      options: stoneType
    });
  } catch (err) {
    console.log("Error in StoneType Page!", err);
    req.flash("error", "Error in StoneType Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStoneTypePage = async function (req, res) {
  try {
    await StoneType.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ")
    });
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Adding StoneType!", err);
    req.flash("error", "Error in Adding StoneType!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editStoneTypePage = async function (req, res) {
  try {
    let temp = await StoneType.findById(req.body.oldname);
    temp.name = req.body.newname.replace(/[^a-zA-Z0-9 ]/g, " ");
    await temp.save();
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Editing StoneType!", err);
    req.flash("error", "Error in Editing StoneType!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.delStoneTypePage = async function (req, res) {
  try {
    let temp = await Stock.find({
      "stoneTable.type": req.body.name
    });
    if (!temp.length) {
      await StoneType.findByIdAndDelete(req.body.name);
      req.flash("success", "Deleted Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    }
    req.flash("error", "Item in Use!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Deleting StoneType!", err);
    req.flash("error", "Error in Deleting StoneType!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

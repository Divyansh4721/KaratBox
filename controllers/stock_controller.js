const Env_Variable = require("../models/env_variable");
const Index = require("../models/index");
const Kaarigar = require("../models/list_master/kaarigar");
const Ornament = require("../models/list_master/ornament");
const Prefix = require("../models/list_master/prefix");
const Purity = require("../models/list_master/purity");
const StockType = require("../models/list_master/stocktype");
const StoneDealer = require("../models/list_master/stonedealer");
const StoneType = require("../models/list_master/stonetype");
const Stock = require("../models/stock");
const User = require("../models/user");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
module.exports.stockAddPage = async function (req, res) {
  try {
    let indexTable = await Index.find();
    let kaarigarTable = await Kaarigar.find().sort({
      name: 1
    });
    let ornamentTable = await Ornament.find().sort({
      name: 1
    });
    let prefixTable = await Prefix.find().sort({
      name: 1
    });
    let purityTable = await Purity.find();
    let stockTypeTable = await StockType.find().sort({
      name: 1
    });
    let stoneDealerTable = await StoneDealer.find().sort({
      name: 1
    });
    let stoneTypeTable = await StoneType.find().sort({
      name: 1
    });
    let envVar = await Index.findOne({
      name: "index"
    });
    return res.render("inventory/stock_add", {
      title: "Add Stock",
      activeNav: "inventory",
      index: envVar.index * 1 + 1,
      indexTable,
      kaarigarTable,
      ornamentTable,
      prefixTable,
      purityTable,
      stockTypeTable,
      stoneDealerTable,
      stoneTypeTable,
      breadcrumbs: breadcrumb.trail([
        { label: "Inventory", href: "/inventory" },
        { label: "Add Stock" }
      ])
    });
  } catch (err) {
    console.log("Error in Stock Add Page!", err);
    req.flash("error", "Error in Stock Add Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addStockApi = async function (req, res) {
  try {
    let envVar = await Index.findOne({
      name: "index"
    });
    envVar.index = envVar.index * 1 + 1;
    await envVar.save();
    req.fileCounter = 0;
    req.fileName = envVar.index;
    Stock.uploadImage(req, res, async function (err) {
      if (err) {
        console.log("************Multer Error", err);
        req.flash("error", "File Type Not Correct!");
        return res.redirect(req.get("Referrer") || "/");
      }
      if (!req.files || !req.files.length) {
        req.flash("error", "Please add at least one product image.");
        return res.redirect("/stock_add");
      }
      let env = require("../config/environment");
      let path = require("path");
      let imagePath = Stock.imagePath;
      let fs = require("fs");
      for (let i = 0; i < req.files.length; i++) {
        let dest = path.join(
          imagePath,
          req.body.index + "-" + (i + 1) + ".png"
        );
        await fs.writeFile(dest, req.files[i].buffer, () => { });
        req.files[i].filename = path.join(
          req.body.index + "-" + (i + 1) + ".png"
        );
      }
      let indexNo = envVar.index;
      let SKU = "";
      let tag = 0;
      //Tag
      {
        let indexTable = await Index.find();
        let prefix = req.body.prefix;
        let ornament = req.body.ornament;
        let availableArr = indexTable.find(
          (item) =>
            item.prefix &&
            item.prefix.toString() === prefix &&
            item.ornament &&
            item.ornament.toString() === ornament
        ).available;
        tag = availableArr.length ? availableArr.length + 1 : 1;
        if (availableArr.length) {
          availableArr.sort((a, b) => a - b);
          for (let i = 1; i <= availableArr.length; i++) {
            if (availableArr[i - 1] !== i) {
              tag = i;
              break;
            }
          }
        }
      }
      let prefix = req.body.prefix;
      let ornament = req.body.ornament;
      let grossWt = (req.body.grossWt * 1).toFixed(3);
      let netWt = (req.body.netWt * 1).toFixed(3);
      let stoneWt = (req.body.stoneWt * 1).toFixed(3);
      // let costPurity = (req.body.costPurity * 1).toFixed(2);
      let kaarigar = req.body.kaarigar;
      let stockType = req.body.stockType;
      let HUID = req.body.huid.replace(/[^a-zA-Z0-9 ]/g, " ");
      let remark = req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ");
      let purity = req.body.purity;
      let isKDM = req.body.isKDM !== undefined;
      let isInStock = true;
      let createdBy = req.user.id;
      let createdDate = new Date();
      let stoneTable = [];
      if (req.body.stoneType) {
        for (let i = 0; i < req.body.stoneType.length; i++) {
          let temp = {
            type: req.body.stoneType[i],
            ctWeight: (req.body.stoneWeight[i] * 1).toFixed(3),
            gmWeight: (req.body.stoneWeight[i] / 5).toFixed(3),
            purchaseRate: (req.body.purchaseRate[i] * 1).toFixed(0),
            sellRate: (req.body.sellRate[i] * 1).toFixed(0),
            dealerName: req.body.stoneDealer[i]
              ? req.body.stoneDealer[i]
              : undefined
          };
          stoneTable.push(temp);
        }
      }
      let stockImage = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          let temp = {
            fileName: req.files[i].filename
          };
          stockImage.push(temp);
        }
      }
      let tempStock = await Stock.create({
        index: indexNo,
        SKU,
        tag,
        prefix,
        ornament,
        grossWt,
        netWt,
        stoneWt,
        stockType,
        purity,
        isInStock,
        isKDM,
        createdBy,
        createdDate,
        stoneTable,
        stockImage
      });
      // tempStock.costPurity = costPurity ? costPurity : 0;
      tempStock.kaarigar = kaarigar ? kaarigar : undefined;
      tempStock.HUID = HUID ? HUID : "";
      tempStock.remark = remark ? remark : "";
      await tempStock.save();
      let index = await Index.findOne({
        prefix,
        ornament
      });
      index.available.push(tag * 1);
      await index.save();
      // index = await Index.findOne({
      //     name: "sku"
      // });
      // index.available.push(SKU * 1);
      // await index.save();
    });
    req.flash("success", "Stock Created Successfully!");
    return res.redirect(req.get("Referrer") || "/");
  } catch (err) {
    console.log("Error in Creating New Stock!", err);
    req.flash("error", "Error in Creating New Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockViewPage = async function (req, res) {
  try {
    let stock = await Stock.findById(req.params.id)
      .populate(
        "prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName"
      )
      .populate("createdBy", "email name")
      .populate("deletedBy", "email name")
      .populate("updatedTable.user", "email name")
      .populate({
        path: "bill",
        populate: [
          {
            path: "customer",
            select: "name"
          },
          {
            path: "user",
            select: "email name"
          }
        ]
      })
      .populate({
        path: "approveTable",
        populate: [
          {
            path: "userGave",
            select: "email name"
          },
          {
            path: "userTake",
            select: "email name"
          },
          {
            path: "customer"
          }
        ]
      });
    await common_function.calculatePrice(stock);
    const tagName = common_function.generateTagName(stock);
    return res.render("inventory/stock_view", {
      title: "View Stock",
      stock,
      convertDate: common_function.convertDate,
      breadcrumbs: breadcrumb.trail([
        { label: "Inventory", href: "/inventory" },
        { label: tagName }
      ])
    });
  } catch (err) {
    console.log("Error in Stock Viewing Page!", err);
    req.flash("error", "Error in Stock Viewing Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockEditPage = async function (req, res) {
  try {
    let stock = await Stock.findById(req.params.id);
    if (!stock.isInStock) {
      req.flash("error", "Item is not in stock!");
      return res.redirect(req.get("Referrer") || "/");
    }
    let indexTable = await Index.find();
    let kaarigarTable = await Kaarigar.find().sort({
      name: 1
    });
    let ornamentTable = await Ornament.find().sort({
      name: 1
    });
    let prefixTable = await Prefix.find().sort({
      name: 1
    });
    let purityTable = await Purity.find();
    let stockTypeTable = await StockType.find().sort({
      name: 1
    });
    let stoneDealerTable = await StoneDealer.find().sort({
      name: 1
    });
    let stoneTypeTable = await StoneType.find().sort({
      name: 1
    });
    let envVar = await Index.findOne({
      name: "index"
    });
    return res.render("stock_edit", {
      title: "Edit Stock",
      stock,
      indexTable,
      kaarigarTable,
      ornamentTable,
      prefixTable,
      purityTable,
      stockTypeTable,
      stoneDealerTable,
      stoneTypeTable,
      breadcrumbs: breadcrumb.trail([
        { label: "Inventory", href: "/inventory" },
        { label: "Edit Stock" }
      ])
    });
  } catch (err) {
    console.log("Error in Stock Edit Page!", err);
    req.flash("error", "Error in Stock Edit Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editStockApi = async function (req, res) {
  try {
    req.fileCounter = 0;
    Stock.uploadImage(req, res, async function (err) {
      if (err) {
        console.error("Multer Processing Error:", err);
        req.flash("error", "File Type Not Correct!");
        return res.redirect(req.get("Referrer") || "/");
      }
      const imagePath = Stock.imagePath;
      // 1. Locate current stock object state
      let tempStock = await Stock.findOne({ index: req.body.index })
        .populate("prefix ornament purity kaarigar stockType stoneTable.type stoneTable.dealerName");
      if (!tempStock) {
        req.flash("error", "Stock item not found.");
        return res.redirect("/");
      }
      // 2. Clean old image physical assets safely via Async/Await
      let indexCounter = 1;
      while (true) {
        let oldImgFile = path.join(imagePath, `${req.body.index}-${indexCounter}.png`);
        try {
          await fs.access(oldImgFile);
          await fs.unlink(oldImgFile);
          indexCounter++;
        } catch {
          break; // File doesn't exist, stop looking loop
        }
      }
      for (let img of tempStock.stockImage) {
        try {
          await fs.unlink(path.join(imagePath, img.fileName));
        } catch (_) { }
      }
      // 3. Process new images
      let stockImage = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          let fileName = `${req.body.index}-${i + 1}.png`;
          let dest = path.join(imagePath, fileName);
          await fs.writeFile(dest, req.files[i].buffer);
          stockImage.push({ fileName: fileName });
        }
      }
      // 4. Recalculate prefix index tagging sequences if changed
      let tag = tempStock.tag;
      if (tempStock.prefix.toString() !== req.body.prefix || tempStock.ornament.toString() !== req.body.ornament) {
        let oldIndex = await Index.findOne({ prefix: tempStock.prefix._id, ornament: tempStock.ornament._id });
        if (oldIndex) {
          oldIndex.available = oldIndex.available.filter(obj => obj != tempStock.tag);
          await oldIndex.save();
        }
        let newIndex = await Index.findOne({ prefix: req.body.prefix, ornament: req.body.ornament });
        if (newIndex) {
          let availableArr = newIndex.available;
          tag = availableArr.length + 1;
          if (availableArr.length) {
            availableArr.sort((a, b) => a - b);
            for (let i = 1; i <= availableArr.length; i++) {
              if (availableArr[i - 1] !== i) {
                tag = i;
                break;
              }
            }
          }
          newIndex.available.push(Number(tag));
          await newIndex.save();
        }
      }
      // 5. Build incoming metrics and structures
      const normalizedInputs = {
        tag: Number(tag),
        prefix: req.body.prefix,
        ornament: req.body.ornament,
        grossWt: Number(Number(req.body.grossWt).toFixed(3)),
        netWt: Number(Number(req.body.netWt).toFixed(3)),
        stoneWt: Number(Number(req.body.stoneWt).toFixed(3)),
        kaarigar: req.body.kaarigar || undefined,
        stockType: req.body.stockType,
        purity: req.body.purity,
        isKDM: req.body.isKDM !== undefined,
        HUID: req.body.huid ? req.body.huid.replace(/[^a-zA-Z0-9 ]/g, " ").trim() : "",
        remark: req.body.remark ? req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ").trim() : ""
      };
      let stoneTable = [];
      if (req.body.stoneType) {
        for (let i = 0; i < req.body.stoneType.length; i++) {
          stoneTable.push({
            type: req.body.stoneType[i],
            ctWeight: Number(Number(req.body.stoneWeight[i]).toFixed(3)),
            gmWeight: Number((Number(req.body.stoneWeight[i]) / 5).toFixed(3)),
            purchaseRate: Number(Number(req.body.purchaseRate[i]).toFixed(0)),
            sellRate: Number(Number(req.body.sellRate[i]).toFixed(0)),
            dealerName: req.body.stoneDealer[i] || undefined
          });
        }
      }
      // 6. Compute updates dynamically and compose standard logs
      let changesTracked = [];
      // Array Mapping for human-readable relational strings
      const modelMap = { prefix: Prefix, ornament: Ornament, purity: Purity, stockType: StockType, kaarigar: Kaarigar };
      for (let key in normalizedInputs) {
        let oldVal = tempStock[key];
        let newVal = normalizedInputs[key];
        // Scenario A: DB Object References
        if (oldVal && oldVal._id) {
          if (oldVal._id.toString() !== String(newVal)) {
            let targetRefModel = modelMap[key];
            let newDocName = "N/A";
            if (targetRefModel && newVal) {
              let fetchedDoc = await targetRefModel.findById(newVal);
              if (fetchedDoc) newDocName = fetchedDoc.name || fetchedDoc.prefix;
            }
            changesTracked.push({
              field: key,
              oldValue: oldVal.name || oldVal.prefix || oldVal._id.toString(),
              newValue: newDocName
            });
            tempStock[key] = newVal;
          }
        }
        // Scenario B: Primitive configuration variables
        else if (String(oldVal || "") !== String(newVal || "")) {
          changesTracked.push({
            field: key,
            oldValue: oldVal === undefined ? "" : oldVal,
            newValue: newVal === undefined ? "" : newVal
          });
          tempStock[key] = newVal;
        }
      }
      // Check for array deep deviations (stoneTable tracking changes)
      let isStoneSame = tempStock.stoneTable.length === stoneTable.length;
      if (isStoneSame) {
        for (let i = 0; i < stoneTable.length; i++) {
          if (
            String(tempStock.stoneTable[i].type?._id || tempStock.stoneTable[i].type) !== String(stoneTable[i].type) ||
            Number(tempStock.stoneTable[i].ctWeight) !== Number(stoneTable[i].ctWeight) ||
            Number(tempStock.stoneTable[i].purchaseRate || 0) !== Number(stoneTable[i].purchaseRate || 0) ||
            Number(tempStock.stoneTable[i].sellRate || 0) !== Number(stoneTable[i].sellRate || 0) ||
            String(tempStock.stoneTable[i].dealerName?._id || tempStock.stoneTable[i].dealerName || "") !== String(stoneTable[i].dealerName || "")
          ) {
            isStoneSame = false;
            break;
          }
        }
      }
      if (!isStoneSame) {
        changesTracked.push({
          field: "stoneTable",
          oldValue: "Previous Table Layout",
          newValue: "Modified Table Layout"
        });
        tempStock.stoneTable = stoneTable;
      }
      // Save asset image mappings
      tempStock.stockImage = stockImage;
      // 7. Persist changes inside database
      await tempStock.save();
      // 8. Generate operational AuditLog entry if changes exist
      if (changesTracked.length > 0) {
        await AuditLog.create({
          user: req.user.id,
          action: "UPDATE",
          targetModel: "Stock",
          targetId: tempStock._id,
          targetIdentifier: `Index: ${tempStock.index} | Tag: ${tempStock.tag}`,
          changes: changesTracked,
          remark: "Stock configuration parameters modified cleanly via control panel grid interface"
        });
      }
      req.flash("success", "Stock Edited Successfully!");
      return res.redirect(`/stock/${tempStock.id}`);
    });
  } catch (err) {
    console.error("Critical System Failure updating stock item:", err);
    req.flash("error", "Error in Editing New Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockImageEditPage = async function (req, res) {
  try {
    let stock = await Stock.findById(req.params.id);
    if (!stock.isInStock) {
      req.flash("error", "Item is not in stock!");
      return res.redirect(req.get("Referrer") || "/");
    }
    let indexTable = await Index.find();
    let kaarigarTable = await Kaarigar.find().sort({
      name: 1
    });
    let ornamentTable = await Ornament.find().sort({
      name: 1
    });
    let prefixTable = await Prefix.find().sort({
      name: 1
    });
    let purityTable = await Purity.find();
    let stockTypeTable = await StockType.find().sort({
      name: 1
    });
    let stoneDealerTable = await StoneDealer.find().sort({
      name: 1
    });
    let stoneTypeTable = await StoneType.find().sort({
      name: 1
    });
    let envVar = await Index.findOne({
      name: "index"
    });
    return res.render("stock_image_edit", {
      title: "Edit Image Stock",
      stock,
      indexTable,
      kaarigarTable,
      ornamentTable,
      prefixTable,
      purityTable,
      stockTypeTable,
      stoneDealerTable,
      stoneTypeTable,
      breadcrumbs: breadcrumb.trail([
        { label: "Inventory", href: "/inventory" },
        { label: "Edit Images" }
      ])
    });
  } catch (err) {
    console.log("Error in Stock Edit Page!", err);
    req.flash("error", "Error in Stock Edit Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.editStockImageApi = async function (req, res) {
  try {
    req.fileCounter = 0;
    Stock.uploadImage(req, res, async function (err) {
      if (err) {
        console.log("************Multer Error", err);
        req.flash("error", "File Type Not Correct!");
        return res.redirect(req.get("Referrer") || "/");
      }
      let env = require("../config/environment");
      let path = require("path");
      let imagePath = Stock.imagePath;
      let fs = require("fs");
      for (
        let i = 0;
        await fs.existsSync(
          path.join(imagePath, req.body.index + "-" + (i + 1) + ".png")
        );
        i++
      ) {
        await fs.unlinkSync(
          path.join(imagePath, req.body.index + "-" + (i + 1) + ".png")
        );
      }
      let tempStock = await Stock.findOne({
        index: req.body.index
      });
      for (let i = 0; i < tempStock.stockImage.length; i++) {
        if (
          await fs.existsSync(
            path.join(imagePath, tempStock.stockImage[i].fileName)
          )
        ) {
          await fs.unlinkSync(
            path.join(imagePath, tempStock.stockImage[i].fileName)
          );
        }
      }
      for (let i = 0; i < req.files.length; i++) {
        let dest = path.join(
          imagePath,
          req.body.index + "-" + (i + 1) + ".png"
        );
        await fs.writeFile(dest, req.files[i].buffer, () => { });
        req.files[i].filename = path.join(
          req.body.index + "-" + (i + 1) + ".png"
        );
      }
      let stockImage = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          let temp = {
            fileName: req.files[i].filename
          };
          stockImage.push(temp);
        }
      }
      tempStock.updatedTable.push({
        user: req.user.id,
        date: new Date(),
        remark: "** Last Updated By **"
      });
      tempStock.stockImage = stockImage;
      await tempStock.save();
      req.flash("success", "Stock Edited Successfully!");
      return res.redirect("/stock/" + tempStock.id);
    });
  } catch (err) {
    console.log("Error in Editing New Stock!", err);
    req.flash("error", "Error in Editing New Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockTransferPage = async function (req, res) {
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
    let stockTypeTable = await StockType.find().sort({
      name: 1
    });
    let kaarigarTable = await Kaarigar.find().sort({
      name: 1
    });
    return res.render("stock_edit_multiple", {
      title: "Edit Multiple",
      activeNav: "inventory",
      stockTable,
      stockTypeTable,
      kaarigarTable,
      breadcrumbs: breadcrumb.trail([
        { label: "Cart", href: "/cart" },
        { label: "Edit Multiple" }
      ])
    });
  } catch (err) {
    console.log("Error in Multiple Stock Edit Page!", err);
    req.flash("error", "Error in Multiple Stock Edit Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockTransferApi = async function (req, res) {
  try {
    let user = await User.findById(req.user).populate("cart");
    let stockTable = user.cart;
    stockTable = stockTable.filter((item) => item.isInStock);
    if (!stockTable.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    let newStockType = await StockType.findById(req.body.stockType);
    let tempUser = await User.findById(req.user).populate({
      path: "cart",
      populate: "stockType"
    });
    let tempStockTable = tempUser.cart;
    tempStockTable = tempStockTable.filter((item) => item.isInStock);
    for (let i = 0; i < stockTable.length; i++) {
      stockTable[i].updatedTable.push({
        user: req.user.id,
        date: new Date(),
        remark:
          "stockType" +
          " old: " +
          tempStockTable[i].stockType.name +
          " new: " +
          newStockType.name
      });
      stockTable[i].stockType = req.body.stockType;
      await stockTable[i].save();
    }
    req.flash("success", "Edited Items Successfully!");
    return res.redirect("cart");
  } catch (err) {
    console.log("Error in Editing Multiple Stock!", err);
    req.flash("error", "Error in Editing Multiple Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.printTagPage = async function (req, res) {
  try {
    let stockTable = await Stock.find({
      _id: req.query.id
    }).populate("prefix ornament purity stockType stoneTable.type kaarigar");
    stockTable = stockTable.filter((item) => item.tag !== null);
    if (!stockTable.length) {
      req.flash("error", "Item is not in stock!");
      return res.redirect(req.get("Referrer") || "/");
    }
    for (let i of stockTable) {
      i.updatedTable.push({
        user: req.user.id,
        date: new Date(),
        remark: "** Tag Printed  **"
      });
      await i.save();
    }
    for (let i of stockTable) {
      i.sellingPrice = 0;
      for (let j = 0; j < i.stoneTable.length; j++) {
        let stoneWt = i.stoneTable[j].ctWeight * 1;
        let stoneRate = i.stoneTable[j].sellRate * 1;
        stoneWt = stoneWt ? stoneWt : 1;
        i.sellingPrice += stoneWt * stoneRate;
      }
    }
    let tag_name = await Env_Variable.findOne({
      name: "TagName"
    });
    return res.render("tags", {
      title: "Tags",
      activeNav: "inventory",
      stockTable,
      tag_name: tag_name.value,
      backHref: "/stock/" + stockTable[0]._id
    });
  } catch (err) {
    console.log("Error in Multiple Tags Print Page!", err);
    req.flash("error", "Error in Multiple Tags Print Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.printMultipleTagsPage = async function (req, res) {
  try {
    let user = await User.findById(req.user);
    let stockTable = user.cart;
    stockTable = await Stock.find({
      _id: {
        $in: stockTable
      }
    })
      .populate("prefix ornament purity stockType stoneTable.type kaarigar")
      .sort({
        prefix: 1,
        ornament: 1,
        tag: 1
      });
    stockTable = stockTable.filter((item) => item.tag !== null);
    if (!stockTable.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    for (let i of stockTable) {
      i.updatedTable.push({
        user: req.user.id,
        date: new Date(),
        remark: "** Tag Printed  **"
      });
      await i.save();
    }
    for (let i of stockTable) {
      i.sellingPrice = 0;
      for (let j = 0; j < i.stoneTable.length; j++) {
        let stoneWt = i.stoneTable[j].ctWeight * 1;
        let stoneRate = i.stoneTable[j].sellRate * 1;
        stoneWt = stoneWt ? stoneWt : 1;
        i.sellingPrice += stoneWt * stoneRate;
      }
    }
    let tag_name = await Env_Variable.findOne({
      name: "TagName"
    });
    return res.render("tags", {
      title: "Print Tags",
      activeNav: "inventory",
      stockTable,
      tag_name: tag_name.value,
      backHref: "/cart",
      breadcrumbs: breadcrumb.trail([
        { label: "Cart", href: "/cart" },
        { label: "Print Tags" }
      ])
    });
  } catch (err) {
    console.log("Error in Multiple Tags Print Page!", err);
    req.flash("error", "Error in Multiple Tags Print Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

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
const AuditLog = require("../models/auditlog");
const common_function = require("../controllers/common_function");
const breadcrumb = require("../config/breadcrumbs");
const path = require("path");
const fs = require("fs").promises;
async function getFilters() {
  const [
    kaarigarTable,
    ornamentTable,
    prefixTable,
    purityTable,
    stockTypeTable,
    stoneDealerTable,
    stoneTypeTable
  ] = await Promise.all([
    Kaarigar.find().sort({ name: 1 }),
    Ornament.find().sort({ name: 1 }),
    Prefix.find().sort({ name: 1 }),
    Purity.find(),
    StockType.find().sort({ name: 1 }),
    StoneDealer.find().sort({ name: 1 }),
    StoneType.find().sort({ name: 1 })
  ]);
  return {
    kaarigarTable,
    ornamentTable,
    prefixTable,
    purityTable,
    stockTypeTable,
    stoneDealerTable,
    stoneTypeTable
  };
}
async function getNextTagNumber(prefix, ornament) {
  try {
    if (!prefix || !ornament) return 1;
    const entry = await Index.findOne({ prefix, ornament });
    let nextLowestNumber = 1;
    if (entry) {
      if (entry.recycledGaps && entry.recycledGaps.length > 0) {
        nextLowestNumber = Math.min(...entry.recycledGaps);
      } else {
        nextLowestNumber = (entry.lastIndex || 0) + 1;
      }
    }
    return nextLowestNumber;
  } catch (err) {
    console.error("Error fetching single tag number:", err);
    throw err;
  }
}
async function getAllNextTags() {
  try {
    const rawIndexes = await Index.find().populate("prefix ornament");
    const optimizedIndexTable = rawIndexes.map((doc) => {
      const plainDoc = doc.toObject();
      if (plainDoc.name === "index") return plainDoc;
      let lowestAvailable = 1;
      if (plainDoc.recycledGaps && plainDoc.recycledGaps.length > 0) {
        lowestAvailable = Math.min(...plainDoc.recycledGaps);
      } else {
        lowestAvailable = (plainDoc.lastIndex || 0) + 1;
      }
      plainDoc.nextLowestIndex = lowestAvailable;
      delete plainDoc.recycledGaps;
      return plainDoc;
    });
    return optimizedIndexTable;
  } catch (err) {
    console.error("Error fetching all tag numbers:", err);
    throw err;
  }
}
module.exports.stockAddPage = async function (req, res) {
  try {
    const [filters, indexTable, envVar] = await Promise.all([
      getFilters(),
      getAllNextTags(),
      Index.findOne({ name: "index" })
    ]);
    const nextGlobalIndex = envVar ? envVar.index * 1 + 1 : 1;
    return res.render("inventory/add", {
      title: "Add Stock",
      activeNav: "inventory",
      index: nextGlobalIndex,
      indexTable,
      ...filters,
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
    let envVar = await Index.findOne({ name: "index" });
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
      let imagePath = Stock.imagePath;
      for (let i = 0; i < req.files.length; i++) {
        let dest = path.join(
          imagePath,
          req.body.index + "-" + (i + 1) + ".png"
        );
        await fs.writeFile(dest, req.files[i].buffer);
        req.files[i].filename = req.body.index + "-" + (i + 1) + ".png";
      }
      let indexNo = envVar.index;
      let SKU = "";
      let prefix = req.body.prefix;
      let ornament = req.body.ornament;
      let indexDoc = await Index.findOne({ prefix, ornament });
      if (!indexDoc) {
        indexDoc = await Index.create({
          prefix,
          ornament,
          lastIndex: 0,
          recycledGaps: []
        });
      }
      let tag = 1;
      if (indexDoc.recycledGaps && indexDoc.recycledGaps.length > 0) {
        tag = Math.min(...indexDoc.recycledGaps);
        indexDoc.recycledGaps = indexDoc.recycledGaps.filter((g) => g !== tag);
      } else {
        indexDoc.lastIndex = (indexDoc.lastIndex || 0) + 1;
        tag = indexDoc.lastIndex;
      }
      await indexDoc.save();
      let grossWt = (req.body.grossWt * 1).toFixed(3);
      let netWt = (req.body.netWt * 1).toFixed(3);
      let stoneWt = (req.body.stoneWt * 1).toFixed(3);
      let kaarigar = req.body.kaarigar;
      let stockType = req.body.stockType;
      let HUID = req.body.huid;
      let remark = req.body.remark;
      let purity = req.body.purity;
      let isKDM = req.body.isKDM !== undefined;
      let isInStock = true;
      let createdBy = req.user.id;
      let createdDate = new Date();
      let stoneTable = [];
      if (req.body.stoneType) {
        for (let i = 0; i < req.body.stoneType.length; i++) {
          stoneTable.push({
            type: req.body.stoneType[i],
            ctWeight: (req.body.stoneWeight[i] * 1).toFixed(3),
            gmWeight: (req.body.stoneWeight[i] / 5).toFixed(3),
            purchaseRate: (req.body.purchaseRate[i] * 1).toFixed(0),
            sellRate: (req.body.sellRate[i] * 1).toFixed(0),
            dealerName: req.body.stoneDealer[i] || undefined
          });
        }
      }
      let stockImage = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          stockImage.push({ fileName: req.files[i].filename });
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
      tempStock.kaarigar = kaarigar || undefined;
      tempStock.HUID = HUID;
      tempStock.remark = remark;
      await tempStock.save();
      await AuditLog.create({
        user: req.user.id,
        action: "CREATE",
        targetModel: "Stock",
        targetId: tempStock._id,
        targetIdentifier: `Index: ${tempStock.index} | Tag: ${tempStock.tag}`,
        changes: [],
        remark: "Initial entry generated successfully"
      });
      req.flash("success", "Stock Created Successfully!");
      return res.redirect(req.get("Referrer") || "/");
    });
  } catch (err) {
    console.log("Error in Creating New Stock!", err);
    req.flash("error", "Error in Creating New Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockViewPage = async function (req, res) {
  try {
    let stock = await Stock.findById(req.query.id)
      .populate(
        "prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName"
      )
      .populate("createdBy", "email name")
      .populate("deletedBy", "email name")
      .populate({
        path: "bill",
        populate: [
          { path: "customer", select: "name" },
          { path: "user", select: "email name" }
        ]
      })
      .populate({
        path: "approveTable",
        options: {
          sort: { updatedAt: -1 }
        },
        populate: [
          { path: "userGave", select: "email name" },
          { path: "userTake", select: "email name" },
          { path: "customer" }
        ]
      });
    let auditLogs = await AuditLog.find({
      targetModel: "Stock",
      targetId: stock._id
    })
      .populate("user", "email name")
      .sort({ createdAt: -1 });
    await common_function.calculatePrice(stock);
    const tagName = common_function.generateTagName(stock);
    return res.render("inventory/view", {
      title: "View Stock",
      stock,
      auditLogs,
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
    let stock = await Stock.findById(req.query.id);
    if (!stock.isInStock) {
      req.flash("error", "Item is not in stock!");
      return res.redirect(req.get("Referrer") || "/");
    }
    const [filters, indexTable] = await Promise.all([
      getFilters(),
      getAllNextTags()
    ]);
    return res.render("inventory/edit", {
      title: "Edit Stock",
      stock,
      indexTable,
      ...filters,
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
      let tempStock = await Stock.findOne({ index: req.body.index }).populate(
        "prefix ornament purity kaarigar stockType stoneTable.type stoneTable.dealerName"
      );
      if (!tempStock) {
        req.flash("error", "Stock item not found.");
        return res.redirect("/");
      }
      let indexCounter = 1;
      while (true) {
        let oldImgFile = path.join(
          imagePath,
          `${req.body.index}-${indexCounter}.png`
        );
        try {
          await fs.access(oldImgFile);
          await fs.unlink(oldImgFile);
          indexCounter++;
        } catch {
          break;
        }
      }
      for (let img of tempStock.stockImage) {
        try {
          await fs.unlink(path.join(imagePath, img.fileName));
        } catch (_) {}
      }
      let stockImage = [];
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          let fileName = `${req.body.index}-${i + 1}.png`;
          let dest = path.join(imagePath, fileName);
          await fs.writeFile(dest, req.files[i].buffer);
          stockImage.push({ fileName: fileName });
        }
      }
      let tag = tempStock.tag;
      if (
        tempStock.prefix.toString() !== req.body.prefix ||
        tempStock.ornament.toString() !== req.body.ornament
      ) {
        let oldIndex = await Index.findOne({
          prefix: tempStock.prefix._id,
          ornament: tempStock.ornament._id
        });
        if (oldIndex) {
          if (!oldIndex.recycledGaps.includes(tempStock.tag)) {
            oldIndex.recycledGaps.push(Number(tempStock.tag));
            await oldIndex.save();
          }
        }
        tag = await getNextTagNumber(req.body.prefix, req.body.ornament);
        let newIndex = await Index.findOne({
          prefix: req.body.prefix,
          ornament: req.body.ornament
        });
        if (!newIndex) {
          newIndex = await Index.create({
            prefix: req.body.prefix,
            ornament: req.body.ornament,
            lastIndex: tag,
            recycledGaps: []
          });
        } else {
          if (newIndex.recycledGaps && newIndex.recycledGaps.includes(tag)) {
            newIndex.recycledGaps = newIndex.recycledGaps.filter(
              (g) => g !== tag
            );
          } else {
            newIndex.lastIndex = tag;
          }
        }
        await newIndex.save();
      }
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
        HUID: req.body.huid
          ? req.body.huid.replace(/[^a-zA-Z0-9 ]/g, " ").trim()
          : "",
        remark: req.body.remark
          ? req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ").trim()
          : ""
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
      let changesTracked = [];
      const modelMap = {
        prefix: Prefix,
        ornament: Ornament,
        purity: Purity,
        stockType: StockType,
        kaarigar: Kaarigar
      };
      for (let key in normalizedInputs) {
        let oldVal = tempStock[key];
        let newVal = normalizedInputs[key];
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
        } else if (String(oldVal || "") !== String(newVal || "")) {
          changesTracked.push({
            field: key,
            oldValue: oldVal === undefined ? "" : oldVal,
            newValue: newVal === undefined ? "" : newVal
          });
          tempStock[key] = newVal;
        }
      }
      let stoneTableChanges = [];
      const maxRows = Math.max(tempStock.stoneTable.length, stoneTable.length);
      for (let i = 0; i < maxRows; i++) {
        let oldRow = tempStock.stoneTable[i];
        let newRow = stoneTable[i];
        if (oldRow && !newRow) {
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}]`,
            oldValue: `Stone Type: ${oldRow.type.name}, Wt: ${oldRow.ctWeight}ct, PRate: ${oldRow.purchaseRate}, SRate: ${oldRow.sellRate}, Dealer: ${oldRow.dealerName?.name || ""}`,
            newValue: "Deleted"
          });
          continue;
        }
        if (!oldRow && newRow) {
          let newName = await StoneType.findById(newRow.type);
          let newDealer = await StoneDealer.findById(newRow.dealerName);
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}]`,
            oldValue: "New Row",
            newValue: `Stone Type: ${newName?.name}, Wt: ${newRow.ctWeight}ct, PRate: ${newRow.purchaseRate}, SRate: ${newRow.sellRate}, Dealer: ${newDealer?.name || ""}`
          });
          continue;
        }
        let oldTypeStr = String(oldRow.type?._id || oldRow.type || "");
        let newTypeStr = String(newRow.type || "");
        if (oldTypeStr !== newTypeStr) {
          let newName = await StoneType.findById(newRow.type);
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}] - Type`,
            oldValue: oldRow.type?.name || "Empty",
            newValue: newName?.name || "Empty"
          });
        }
        if (Number(oldRow.ctWeight) !== Number(newRow.ctWeight)) {
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}] - Weight (ct)`,
            oldValue: String(oldRow.ctWeight),
            newValue: String(newRow.ctWeight)
          });
        }
        if (
          Number(oldRow.purchaseRate || 0) !== Number(newRow.purchaseRate || 0)
        ) {
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}] - Purchase Rate`,
            oldValue: String(oldRow.purchaseRate || 0),
            newValue: String(newRow.purchaseRate || 0)
          });
        }
        if (Number(oldRow.sellRate || 0) !== Number(newRow.sellRate || 0)) {
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}] - Sell Rate`,
            oldValue: String(oldRow.sellRate || 0),
            newValue: String(newRow.sellRate || 0)
          });
        }
        let oldDealerStr = String(
          oldRow.dealerName?._id || oldRow.dealerName || ""
        );
        let newDealerStr = String(newRow.dealerName || "");
        if (oldDealerStr !== newDealerStr) {
          let newDealer = await StoneDealer.findById(newRow.dealerName);
          stoneTableChanges.push({
            field: `stoneTable[Row ${i + 1}] - Dealer`,
            oldValue: oldRow.dealerName?.name || "Empty",
            newValue: newDealer?.name || "Empty"
          });
        }
      }
      if (stoneTableChanges.length > 0) {
        changesTracked.push(...stoneTableChanges);
        tempStock.stoneTable = stoneTable;
      }
      tempStock.stockImage = stockImage;
      await tempStock.save();
      if (changesTracked.length > 0) {
        await AuditLog.create({
          user: req.user.id,
          action: "UPDATE",
          targetModel: "Stock",
          targetId: tempStock._id,
          targetIdentifier: `Index: ${tempStock.index} | Tag: ${tempStock.tag}`,
          changes: changesTracked,
          remark: "Stock item details updated via Edit Page"
        });
      }
      req.flash("success", "Stock Edited Successfully!");
      return res.redirect(`/stock?id=${tempStock.id}`);
    });
  } catch (err) {
    console.error("Critical System Failure updating stock item:", err);
    req.flash("error", "Error in Editing New Stock!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.stockImageEditPage = async function (req, res) {
  try {
    let stock = await Stock.findById(req.query.id).populate(
      "prefix ornament purity kaarigar stockType approveTable stoneTable.type stoneTable.dealerName"
    );
    if (!stock.isInStock) {
      req.flash("error", "Item is not in stock!");
      return res.redirect(req.get("Referrer") || "/");
    }
    return res.render("inventory/edit_images", {
      title: "Edit Images Stock",
      stock,
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
      let imagePath = Stock.imagePath;
      let i = 0;
      while (true) {
        let targetPath = path.join(
          imagePath,
          req.body.index + "-" + (i + 1) + ".png"
        );
        try {
          await fs.access(targetPath);
          await fs.unlink(targetPath);
          i++;
        } catch {
          break;
        }
      }
      let tempStock = await Stock.findOne({ index: req.body.index });
      for (let img of tempStock.stockImage) {
        try {
          let specPath = path.join(imagePath, img.fileName);
          await fs.access(specPath);
          await fs.unlink(specPath);
        } catch (_) {}
      }
      for (let i = 0; i < req.files.length; i++) {
        let dest = path.join(
          imagePath,
          req.body.index + "-" + (i + 1) + ".png"
        );
        await fs.writeFile(dest, req.files[i].buffer);
        req.files[i].filename = req.body.index + "-" + (i + 1) + ".png";
      }
      let stockImage = [];
      if (req.files) {
        for (let i = 0; i < req.files.length; i++) {
          stockImage.push({ fileName: req.files[i].filename });
        }
      }
      oldImageCount = tempStock.stockImage.length;
      tempStock.stockImage = stockImage;
      await tempStock.save();
      await AuditLog.create({
        user: req.user.id,
        action: "UPDATE",
        targetModel: "Stock",
        targetId: tempStock._id,
        targetIdentifier: `Index: ${tempStock.index} | Tag: ${tempStock.tag}`,
        changes: [
          {
            field: "stockImage",
            oldValue: oldImageCount, // Old length of images
            newValue: stockImage.length // New length of images
          }
        ],
        remark: "Stock images updated via Edit Images Page"
      });
      req.flash("success", "Stock Edited Successfully!");
      return res.redirect("/stock?id=" + tempStock.id);
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
    let stockTable = await Stock.find({ _id: { $in: user.cart } })
      .populate("prefix ornament purity stockType stoneTable.type")
      .sort({ prefix: 1, ornament: 1, tag: 1 });
    stockTable = stockTable.filter((item) => item.isInStock);
    const { stockTypeTable, kaarigarTable } = await getFilters();
    return res.render("inventory/transfer", {
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
    let stockTable = user.cart.filter((item) => item.isInStock);
    if (!stockTable.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    let newStockType = await StockType.findById(req.body.stockType);
    let tempUser = await User.findById(req.user).populate({
      path: "cart",
      populate: "stockType"
    });
    let tempStockTable = tempUser.cart.filter((item) => item.isInStock);
    for (let i = 0; i < stockTable.length; i++) {
      const oldStockTypeName = tempStockTable[i].stockType
        ? tempStockTable[i].stockType.name
        : "N/A";
      stockTable[i].stockType = req.body.stockType;
      await stockTable[i].save();
      await AuditLog.create({
        user: req.user.id,
        action: "UPDATE",
        targetModel: "Stock",
        targetId: stockTable[i]._id,
        targetIdentifier: `Index: ${stockTable[i].index} | Tag: ${stockTable[i].tag}`,
        changes: [
          {
            field: "stockType",
            oldValue: oldStockTypeName,
            newValue: newStockType.name
          }
        ],
        remark: `Stock type change via Stock Transfer Page`
      });
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
    let stockTable = await Stock.find({ _id: req.query.id }).populate(
      "prefix ornament purity stockType stoneTable.type kaarigar"
    );
    stockTable = stockTable.filter((item) => item.tag !== null);
    if (!stockTable.length) {
      req.flash("error", "Item is not in stock!");
      return res.redirect(req.get("Referrer") || "/");
    }
    for (let i of stockTable) {
      await AuditLog.create({
        user: req.user.id,
        action: "EXPORT",
        targetModel: "Stock",
        targetId: i._id,
        targetIdentifier: `Index: ${i.index} | Tag: ${i.tag}`,
        changes: [
          {
            field: "tagPrinted",
            oldValue: false,
            newValue: true
          }
        ],
        remark: "Single label printed"
      });
    }
    for (let i of stockTable) {
      i.sellingPrice = 0;
      for (let j = 0; j < i.stoneTable.length; j++) {
        let stoneWt = i.stoneTable[j].ctWeight * 1;
        let stoneRate = i.stoneTable[j].sellRate * 1;
        i.sellingPrice += (stoneWt ? stoneWt : 1) * stoneRate;
      }
    }
    let tag_name = await Env_Variable.findOne({ name: "TagName" });
    return res.render("print/tags", {
      layout: false,
      stockTable,
      tag_name: tag_name.value
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
    let stockTable = await Stock.find({ _id: { $in: user.cart } })
      .populate("prefix ornament purity stockType stoneTable.type kaarigar")
      .sort({ prefix: 1, ornament: 1, tag: 1 });
    stockTable = stockTable.filter((item) => item.tag !== null);
    if (!stockTable.length) {
      req.flash("error", "Cart is Empty!");
      return res.redirect(req.get("Referrer") || "/");
    }
    for (let i of stockTable) {
      await AuditLog.create({
        user: req.user.id,
        action: "EXPORT",
        targetModel: "Stock",
        targetId: i._id,
        targetIdentifier: `Index: ${i.index} | Tag: ${i.tag}`,
        changes: [
          {
            field: "tagPrinted",
            oldValue: false,
            newValue: true
          }
        ],
        remark: "Multiple labels printed"
      });
    }
    for (let i of stockTable) {
      i.sellingPrice = 0;
      for (let j = 0; j < i.stoneTable.length; j++) {
        let stoneWt = i.stoneTable[j].ctWeight * 1;
        let stoneRate = i.stoneTable[j].sellRate * 1;
        i.sellingPrice += (stoneWt ? stoneWt : 1) * stoneRate;
      }
    }
    let tag_name = await Env_Variable.findOne({ name: "TagName" });
    return res.render("print/tags", {
      layout: false,
      stockTable,
      tag_name: tag_name.value
    });
  } catch (err) {
    console.log("Error in Multiple Tags Print Page!", err);
    req.flash("error", "Error in Multiple Tags Print Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};

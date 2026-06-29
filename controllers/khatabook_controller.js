const KhataBook = require("../models/khatabook/book");
const KhataBookClient = require("../models/khatabook/client");
const KhataBookEntry = require("../models/khatabook/entry");
const common_function = require("./common_function");
const breadcrumb = require("../config/breadcrumbs");
module.exports.allBooksPage = async function (req, res) {
  try {
    let books = await KhataBook.find().sort({ createdAt: -1 });
    return res.render("khatabook/books_table", {
      title: "Books List",
      books,
      convertDate: common_function.convertDate,
      breadcrumbLabel: "KhataBook Management"
    });
  } catch (err) {
    console.log("Error in All Books Page!", err);
    req.flash("error", "Error loading Books Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addBookApi = async function (req, res) {
  try {
    if (!req.body.name) {
      return res
        .status(400)
        .json({ success: false, message: "Book Name is required!" });
    }
    let cleanName = req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ");
    let existingBook = await KhataBook.findOne({ name: cleanName });
    if (existingBook) {
      return res
        .status(409)
        .json({ success: false, message: "Book Name already exists!" });
    }
    let book = await KhataBook.create({ name: cleanName });
    return res.status(200).json({
      success: true,
      message: "Added Book Successfully!",
      data: book
    });
  } catch (err) {
    console.log("Error in Adding Book!", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Book Name already exists!" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error in Adding Book!" });
  }
};
module.exports.editBookApi = async function (req, res) {
  try {
    let book = await KhataBook.findById(req.body.id);
    if (!book) {
      return res
        .status(444)
        .json({ success: false, message: "Book not found!" });
    }
    let cleanName = req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ");
    let duplicateCheck = await KhataBook.findOne({
      name: cleanName,
      _id: { $ne: req.body.id }
    });
    if (duplicateCheck) {
      return res
        .status(409)
        .json({ success: false, message: "Book Name already exists!" });
    }
    book.name = cleanName;
    await book.save();
    return res.status(200).json({
      success: true,
      message: "Edited Book Successfully!",
      data: book
    });
  } catch (err) {
    console.log("Error in Editing Book!", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Book Name already exists!" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error in Editing Book!" });
  }
};
module.exports.delBookApi = async function (req, res) {
  try {
    let clientsCount = await KhataBookClient.countDocuments({
      book: req.query.id
    });
    if (clientsCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Book has active clients linked to it. Settle or remove them first."
      });
    }
    await KhataBook.findByIdAndDelete(req.query.id);
    return res
      .status(200)
      .json({ success: true, message: "Deleted Book Successfully!" });
  } catch (err) {
    console.log("Error in Deleting Book!", err);
    return res
      .status(500)
      .json({ success: false, message: "Error in Deleting Book!" });
  }
};
module.exports.allClientsPage = async function (req, res) {
  try {
    let clients = await KhataBookClient.find()
      .populate("book")
      .sort({ name: 1 });
    return res.render("khatabook/clients_table", {
      title: "Clients List",
      clients,
      convertDate: common_function.convertDate,
      breadcrumbLabel: "Client Management"
    });
  } catch (err) {
    console.log("Error in All Clients Page!", err);
    req.flash("error", "Error loading Clients Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addClientApi = async function (req, res) {
  try {
    if (!req.body.phNum) {
      return res
        .status(400)
        .json({ success: false, message: "Phone Number not Added!" });
    }
    let check = await KhataBookClient.findOne({
      phNum: Number(req.body.phNum)
    });
    if (check) {
      return res.status(409).json({
        success: false,
        message: "Phone Number already Exists!",
        existingClientId: check.id
      });
    }
    let client = await KhataBookClient.create({
      name: req.body.name.replace(/[^a-zA-Z0-9 ]/g, " "),
      book: req.body.book,
      phNum: req.body.phNum,
      address: req.body.address
        ? req.body.address.replace(/[^a-zA-Z0-9 ]/g, " ")
        : ""
    });
    return res.status(200).json({
      success: true,
      message: "Added Client Successfully!",
      data: client
    });
  } catch (err) {
    console.log("Error in Adding Client!", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Phone Number already Exists!" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error in Adding Client!" });
  }
};
module.exports.editClientApi = async function (req, res) {
  try {
    if (!req.body.phNum) {
      return res
        .status(400)
        .json({ success: false, message: "Phone Number not Added!" });
    }
    let client = await KhataBookClient.findById(req.body.id);
    if (!client) {
      return res
        .status(444)
        .json({ success: false, message: "Client not found!" });
    }
    let check = await KhataBookClient.findOne({
      phNum: Number(req.body.phNum),
      _id: { $ne: req.body.id }
    });
    if (check) {
      return res
        .status(409)
        .json({ success: false, message: "Phone Number already Exists!" });
    }
    client.name = req.body.name.replace(/[^a-zA-Z0-9 ]/g, " ");
    client.book = req.body.book;
    client.phNum = req.body.phNum;
    client.address = req.body.address
      ? req.body.address.replace(/[^a-zA-Z0-9 ]/g, " ")
      : "";
    await client.save();
    return res.status(200).json({
      success: true,
      message: "Edited Client Successfully!",
      data: client
    });
  } catch (err) {
    console.log("Error in Editing Client!", err);
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Phone Number already Exists!" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Error in Editing Client!" });
  }
};
module.exports.delClientApi = async function (req, res) {
  try {
    let entriesCount = await KhataBookEntry.countDocuments({
      client: req.query.id
    });
    if (entriesCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Client has existing transactions. Settle entries first."
      });
    }
    await KhataBookClient.findByIdAndDelete(req.query.id);
    return res
      .status(200)
      .json({ success: true, message: "Deleted Client Successfully!" });
  } catch (err) {
    console.log("Error in Deleting Client!", err);
    return res
      .status(500)
      .json({ success: false, message: "Error in Deleting Client!" });
  }
};
module.exports.allEntriesPage = async function (req, res) {
  try {
    let client = await KhataBookClient.findById(req.query.id).populate("book");
    let rawEntries = await KhataBookEntry.find({ client: req.query.id }).sort({
      createdAt: 1
    });
    let netBalance = 0;
    let entries = [];
    for (let i of rawEntries) {
      if (i.type === "credit") {
        netBalance += (i.amount || 0) * 1;
      } else if (i.type === "debit") {
        netBalance -= (i.amount || 0) * 1;
      }
      entries.push({
        id: i.id,
        type: i.type,
        amount: i.amount,
        remark: i.remark,
        image: i.image,
        date: i.createdAt
      });
    }
    return res.render("khatabook/client_view", {
      title: "Client Ledger",
      client,
      entries,
      netBalance,
      convertDate: common_function.convertDate,
      breadcrumbs: breadcrumb.trail([
        { label: "KhataBook Management", href: "/khatabookTable" },
        { label: client.name }
      ])
    });
  } catch (err) {
    console.log("Error in Client Ledger Page!", err);
    req.flash("error", "Error loading Ledger Page!");
    return res.redirect(req.get("Referrer") || "/");
  }
};
module.exports.addEntryApi = async function (req, res) {
  try {
    KhataBookEntry.uploadImage(req, res, async function (err) {
      if (err) {
        console.log("Multer error during Entry image upload", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      }
      try {
        if (req.file && (req.body.type || req.body.amount)) {
          return res.status(400).json({
            success: false,
            message:
              "An Entry cannot have both an image upload and accounting balance fields!"
          });
        }
        let entryData = {
          client: req.body.client,
          remark: req.body.remark
            ? req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ")
            : ""
        };
        if (req.file) {
          entryData.image =
            KhataBookEntry.imagePath +
            "/" +
            Date.now() +
            "_" +
            req.file.originalname;
          entryData.type = undefined;
          entryData.amount = undefined;
        } else {
          entryData.type = req.body.type;
          entryData.amount = req.body.amount * 1;
          entryData.image = undefined;
        }
        let entry = await KhataBookEntry.create(entryData);
        return res.status(200).json({
          success: true,
          message: "Transaction Added Successfully!",
          data: entry
        });
      } catch (innerErr) {
        console.log("Error inside inner transaction loop!", innerErr);
        return res.status(500).json({
          success: false,
          message: "Error processing transaction data!"
        });
      }
    });
  } catch (err) {
    console.log("Error in Adding KhataBook Entry!", err);
    return res
      .status(500)
      .json({ success: false, message: "Error in Adding Entry!" });
  }
};
module.exports.editEntryApi = async function (req, res) {
  try {
    KhataBookEntry.uploadImage(req, res, async function (err) {
      if (err) {
        console.log("Multer error during Entry update image upload", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      }
      try {
        let entry = await KhataBookEntry.findById(req.body.id);
        if (!entry) {
          return res
            .status(444)
            .json({ success: false, message: "Transaction entry not found!" });
        }
        if (req.file && (req.body.type || req.body.amount)) {
          return res.status(400).json({
            success: false,
            message:
              "An Entry cannot have both an image upload and accounting balance fields!"
          });
        }
        entry.remark = req.body.remark
          ? req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ")
          : "";
        if (req.file) {
          entry.image =
            KhataBookEntry.imagePath +
            "/" +
            Date.now() +
            "_" +
            req.file.originalname;
          entry.type = undefined;
          entry.amount = undefined;
        } else {
          entry.type = req.body.type;
          entry.amount = req.body.amount * 1;
          entry.image = undefined;
        }
        await entry.save();
        return res.status(200).json({
          success: true,
          message: "Transaction Updated Successfully!",
          data: entry
        });
      } catch (innerErr) {
        console.log("Error inside inner entry update loop!", innerErr);
        return res.status(500).json({
          success: false,
          message: "Error processing transaction updates!"
        });
      }
    });
  } catch (err) {
    console.log("Error in Updating KhataBook Entry!", err);
    return res
      .status(500)
      .json({ success: false, message: "Error in Updating Entry!" });
  }
};
module.exports.delEntryApi = async function (req, res) {
  try {
    await KhataBookEntry.findByIdAndDelete(req.query.id);
    return res
      .status(200)
      .json({ success: true, message: "Deleted Transaction Successfully!" });
  } catch (err) {
    console.log("Error in Deleting Entry!", err);
    return res
      .status(500)
      .json({ success: false, message: "Error in Deleting Entry!" });
  }
};
module.exports.settleApi = async function (req, res) {
  try {
    let clientId = req.body.id || req.query.id;
    if (!clientId) {
      return res
        .status(400)
        .json({ success: false, message: "Client identification required!" });
    }
    await KhataBookEntry.deleteMany({ client: clientId });
    return res.status(200).json({
      success: true,
      message: "Client Ledger Settled and Cleared Successfully!"
    });
  } catch (err) {
    console.log("Error in Settling Client Entries!", err);
    return res
      .status(500)
      .json({ success: false, message: "Error in Settling Client Entries!" });
  }
};

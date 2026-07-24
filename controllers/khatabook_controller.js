const KhataBook = require("../models/khatabook/book");
const KhataBookClient = require("../models/khatabook/client");
const KhataBookEntry = require("../models/khatabook/entry");
const common_function = require("./common_function");
const breadcrumb = require("../config/breadcrumbs");
const fs = require("fs");
const path = require("path");
module.exports.allBooksPage = async function (req, res) {
  try {
    let books = await KhataBook.find().sort({ createdAt: -1 });
    return res.render("khatabook/index", {
      title: "Books List",
      books,
      convertDate: common_function.convertDate,
      breadcrumbLabel: "Books"
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
    let clients = await KhataBookClient.find({ book: req.query.book })
      .populate("book")
      .sort({ name: 1 });
    let clientsWithBalances = await Promise.all(
      clients.map(async (client) => {
        let entries = await KhataBookEntry.find({ client: client._id });
        let netBalance = 0;
        let netWeight = 0;
        for (let i of entries) {
          if (i.amount !== undefined && i.amount !== null) {
            if (i.type === "credit") {
              netBalance += i.amount * 1;
            } else if (i.type === "debit") {
              netBalance -= i.amount * 1;
            }
          } else if (i.weight !== undefined && i.weight !== null) {
            if (i.type === "credit") {
              netWeight += i.weight * 1;
            } else if (i.type === "debit") {
              netWeight -= i.weight * 1;
            }
          }
        }
        return {
          ...client.toObject(),
          netBalance,
          netWeight
        };
      })
    );

    return res.render("khatabook/book", {
      title: "Clients List",
      clients: clientsWithBalances,
      convertDate: common_function.convertDate,
      breadcrumbs: breadcrumb.trail([
        { label: "Books", href: "/khatabook" },
        { label: clients[0]?.book?.name || "Clients" }
      ])
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
      createdAt: -1
    });
    let netBalance = 0;
    let netWeight = 0;
    let entries = [];
    for (let i of rawEntries) {
      if (i.amount !== undefined && i.amount !== null) {
        if (i.type === "credit") {
          netBalance += i.amount * 1;
        } else if (i.type === "debit") {
          netBalance -= i.amount * 1;
        }
      } else if (i.weight !== undefined && i.weight !== null) {
        if (i.type === "credit") {
          netWeight += i.weight * 1;
        } else if (i.type === "debit") {
          netWeight -= i.weight * 1;
        }
      }
      entries.push({
        id: i.id,
        type: i.type,
        amount: i.amount,
        weight: i.weight,
        remark: i.remark,
        image: i.image,
        date: i.createdAt
      });
    }
    return res.render("khatabook/client", {
      title: "Client Ledger",
      client,
      entries,
      netBalance,
      netWeight,
      convertDate: common_function.convertDate,
      breadcrumbs: breadcrumb.trail([
        { label: "Books", href: "/khatabook" },
        {
          label: client.book.name,
          href: "/khatabook/clients?book=" + client.book._id
        },
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
        let provideCount = 0;
        if (req.file) provideCount++;
        if (req.body.amount !== undefined && req.body.amount !== "")
          provideCount++;
        if (req.body.weight !== undefined && req.body.weight !== "")
          provideCount++;
        if (provideCount !== 1) {
          return res.status(400).json({
            success: false,
            message:
              "An Entry must contain exactly ONE field: either Amount, Weight, or an Image upload!"
          });
        }
        if ((req.body.amount || req.body.weight) && !req.body.type) {
          return res.status(400).json({
            success: false,
            message:
              "Transaction type (debit/credit) is required for Amount or Weight entries!"
          });
        }
        let entryData = {
          client: req.body.client,
          remark: req.body.remark
            ? req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ")
            : ""
        };
        if (req.file) {
          let imageName =
            Date.now() + "." + req.file.originalname.split(".").pop();
          entryData.image = path.join(KhataBookEntry.imagePath, imageName);
          await fs.promises.writeFile(
            path.join(KhataBookEntry.imageFullPath, imageName),
            req.file.buffer
          );
          entryData.type = undefined;
          entryData.amount = undefined;
          entryData.weight = undefined;
        } else if (req.body.amount) {
          entryData.type = req.body.type;
          entryData.amount = req.body.amount * 1;
          entryData.weight = undefined;
          entryData.image = undefined;
        } else if (req.body.weight) {
          entryData.type = req.body.type;
          entryData.weight = req.body.weight * 1;
          entryData.amount = undefined;
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
        let provideCount = 0;
        if (req.file) provideCount++;
        if (req.body.amount !== undefined && req.body.amount !== "")
          provideCount++;
        if (req.body.weight !== undefined && req.body.weight !== "")
          provideCount++;
        if (provideCount !== 1) {
          return res.status(400).json({
            success: false,
            message:
              "An Entry must contain exactly ONE field: either Amount, Weight, or an Image upload!"
          });
        }
        if ((req.body.amount || req.body.weight) && !req.body.type) {
          return res.status(400).json({
            success: false,
            message:
              "Transaction type (debit/credit) is required for Amount or Weight entries!"
          });
        }
        entry.remark = req.body.remark
          ? req.body.remark.replace(/[^a-zA-Z0-9 ]/g, " ")
          : "";
        if (req.file) {
          let imageName =
            Date.now() + "." + req.file.originalname.split(".").pop();
          entry.image = path.join(KhataBookEntry.imagePath, imageName);
          await fs.promises.writeFile(
            path.join(KhataBookEntry.imageFullPath, imageName),
            req.file.buffer
          );
          entry.type = undefined;
          entry.amount = undefined;
          entry.weight = undefined;
        } else if (req.body.amount) {
          entry.type = req.body.type;
          entry.amount = req.body.amount * 1;
          entry.weight = undefined;
          entry.image = undefined;
        } else if (req.body.weight) {
          entry.type = req.body.type;
          entry.weight = req.body.weight * 1;
          entry.amount = undefined;
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

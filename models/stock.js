const mongoose = require("mongoose");
const StockSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true
    },
    SKU: {
      type: Number
    },
    tag: {
      type: Number
    },
    prefix: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prefix",
      required: true
    },
    ornament: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ornament",
      required: true
    },
    grossWt: {
      type: Number,
      required: true
    },
    netWt: {
      type: Number,
      required: true
    },
    stoneWt: {
      type: Number,
      required: true
    },
    costPurity: {
      type: Number
    },
    purity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purity",
      required: true
    },
    kaarigar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kaarigar"
    },
    stockType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StockType",
      required: true
    },
    isKDM: {
      type: Boolean,
      required: true
    },
    goldPrice: {
      type: Number
    },
    costPrice: {
      type: Number
    },
    sellingPrice: {
      type: Number
    },
    HUID: {
      type: String
    },
    remark: {
      type: String
    },
    isInStock: {
      type: Boolean,
      required: true
    },
    bill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    createdDate: {
      type: Date,
      required: true
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    deletedDate: {
      type: Date
    },
    stoneTable: [
      {
        type: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StoneType",
          required: true
        },
        ctWeight: {
          type: Number,
          required: true
        },
        gmWeight: {
          type: Number,
          required: true
        },
        purchaseRate: {
          type: Number
        },
        sellRate: {
          type: Number
        },
        dealerName: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "StoneDealer"
        }
      }
    ],
    approveTable: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Approval",
        required: true
      }
    ],
    updatedTable: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        },
        remark: {
          type: String
        }
      }
    ],
    stockImage: [
      {
        fileName: {
          type: String,
          required: true
        }
      }
    ]
  },
  {
    timestamps: true
  }
);
const env = require("../config/environment");
const multer = require("multer");
const path = require("path");
const imagePath = path.join(
  __dirname,
  "..",
  "uploads",
  "stock"
);
StockSchema.statics.uploadImage = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  }
}).array("stockImage", 10);
StockSchema.statics.stockPath = imagePath;
const Stock = mongoose.model("Stock", StockSchema);
module.exports = Stock;

const mongoose = require("mongoose");
const EntrySchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  type: {
    type: String,
    enum: ["debit", "credit"]
  },
  amount: {
    type: Number
  },
  weight: {
    type: Number
  },
  image: {
    type: String
  },
  remark: {
    type: String
  }
},
  {
    timestamps: true
  }
);
const env = require("../../config/environment");
const multer = require("multer");
const path = require("path");
const imagePath = path.join(
  "uploads",
  "khatabook"
);
const imageFullPath = path.join(
  __dirname,
  "..",
  "..",
  imagePath
);
EntrySchema.statics.uploadImage = multer({
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
}).single("image");
EntrySchema.statics.imagePath = imagePath;
EntrySchema.statics.imageFullPath = imageFullPath;
const Entry = mongoose.model("Entry", EntrySchema);
module.exports = Entry;

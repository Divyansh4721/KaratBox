const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  avatar: {
    type: String,
    default: ""
  },
  googleAvatar: {
    type: String,
    default: ""
  },
  useGoogleAvatar: {
    type: Boolean,
    default: true
  },
  adminPermissionTemp: {
    type: Boolean,
    required: true
  },
  adminPermissionPerm: {
    type: Boolean,
    required: true
  },
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stock"
    }
  ]
});
const env = require("../../config/environment");
const multer = require("multer");
const path = require("path");
const imagePath = path.join(
  __dirname,
  "..",
  "uploads",
  "avatar"
);
UserSchema.statics.uploadImage = multer({
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
UserSchema.statics.imagePath = imagePath;
const User = mongoose.model("User", UserSchema);
module.exports = User;

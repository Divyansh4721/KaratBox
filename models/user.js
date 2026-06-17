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
const User = mongoose.model("User", UserSchema);
module.exports = User;

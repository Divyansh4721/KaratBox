const mongoose = require("mongoose");
const EnvVarSchema = new mongoose.Schema({
  nickname: {
    type: String
  },
  name: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
});
const EnvVar = mongoose.model("EnvVar", EnvVarSchema);
module.exports = EnvVar;

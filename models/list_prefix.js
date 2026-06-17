const mongoose = require("mongoose");
const PrefixSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  }
});
const Prefix = mongoose.model("Prefix", PrefixSchema);
module.exports = Prefix;

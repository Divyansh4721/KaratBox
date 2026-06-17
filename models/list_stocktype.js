const mongoose = require("mongoose");
const StockTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});
const StockType = mongoose.model("StockType", StockTypeSchema);
module.exports = StockType;

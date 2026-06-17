const mongoose = require("mongoose");
const KaarigarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  }
});
const Kaarigar = mongoose.model("Kaarigar", KaarigarSchema);
module.exports = Kaarigar;

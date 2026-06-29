const mongoose = require("mongoose");
const ClientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true
    },
    phNum: {
      type: Number,
      required: true,
      unique: true
    },
    address: {
      type: String
    }
  },
  {
    timestamps: true
  }
);
const Client = mongoose.model("Client", ClientSchema);
module.exports = Client;

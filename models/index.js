const mongoose = require("mongoose");
const IndexSchema = new mongoose.Schema({
  name: {
    type: String
  },
  index: {
    type: Number
  },
  prefix: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prefix"
  },
  ornament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ornament"
  },
  available: [
    {
      type: Number,
      required: true
    }
  ],
  lastIndex: {
    type: Number
  },
  recycledGaps: [
    {
      type: Number,
      required: true
    }
  ]
});
const Index = mongoose.model("Index", IndexSchema);
module.exports = Index;

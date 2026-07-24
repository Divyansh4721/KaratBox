const mongoose = require("mongoose");
const IndexSchema = new mongoose.Schema({
  prefix: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Prefix"
  },
  ornament: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ornament"
  },
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

const Stock = require("./stock");
const Prefix = require("./list_master/prefix");
const Ornament = require("./list_master/ornament");
async function helper2() {
  let allIndex = [];
  let allPrefixes = await Prefix.find({});
  let allOrnaments = await Ornament.find({});
  for (let prefix of allPrefixes) {
    for (let ornament of allOrnaments) {
      allIndex.push({
        prefix: prefix,
        ornament: ornament,
        available: [],
        recycledGaps: [],
        lastIndex: 1
      });
    }
  }
  let allStock = await Stock.find({
    tag: { $exists: true, $ne: null }
  }).populate("prefix ornament");
  for (let stock of allStock) {
    let index = allIndex.find(
      (i) =>
        i.prefix._id.equals(stock.prefix._id) &&
        i.ornament._id.equals(stock.ornament._id)
    );
    if (index) {
      index.available.push(stock.tag);
    } else {
      console.log("No index found for stock:", stock);
    }
  }
  let count = 0;
  for (let index of allIndex) {
    if (index.available.length > 0) {
      count += index.available.length;
    }
  }
  console.log("Count of tags:", count);
  await Index.deleteMany({});
  for (let index of allIndex) {
    let tagsInStock = index.available;
    tagsInStock = tagsInStock.sort((a, b) => a - b);
    // add all missing tags to recycledGaps
    let recycledGaps = [];
    for (let i = 0; i < tagsInStock.length - 1; i++) {
      let currentTag = tagsInStock[i];
      let nextTag = tagsInStock[i + 1];
      if (nextTag - currentTag > 1) {
        for (let j = currentTag + 1; j < nextTag; j++) {
          recycledGaps.push(j);
        }
      }
    }
    index.recycledGaps = recycledGaps;
    index.lastIndex = tagsInStock.length
      ? tagsInStock[tagsInStock.length - 1] + 1
      : 1;
    if (recycledGaps.length > 0) {
      console.log(
        "************************************",
        index.prefix.name,
        index.ornament.name
      );
      console.log(index.available);
      console.log(index.recycledGaps);
      console.log(index.lastIndex);
    }
    await Index.create({
      prefix: index.prefix._id,
      ornament: index.ornament._id,
      lastIndex: index.lastIndex,
      recycledGaps: index.recycledGaps
    });
  }
  let largestSKU = await Stock.findOne({}).sort({ index: -1 }).limit(1);
  console.log("Largest SKU:", largestSKU ? largestSKU.index : "No stock found");
}
// helper2();

const mongoose = require('mongoose');
const TempSchema = new mongoose.Schema({
    Index: {
        type: String,
    },
    Prefix: {
        type: String,
    },
    Ornament: {
        type: String,
    },
    Tag: {
        type: String,
    },
    StockType: {
        type: String,
    },
    GrossWt: {
        type: String,
    },
    NetWt: {
        type: String,
    },
    StoneWt: {
        type: String,
    },
    Purity: {
        type: String,
    },
    Date: {
        type: String,
    },
    Remark: {
        type: String,
    },
    StoneType1: {
        type: String,
    },
    StoneWeight1: {
        type: String,
    },
    StoneRate1: {
        type: String,
    },
    StoneType2: {
        type: String,
    },
    StoneWeight2: {
        type: String,
    },
    StoneRate2: {
        type: String,
    },
    StoneType3: {
        type: String,
    },
    StoneWeight3: {
        type: String,
    },
    StoneRate3: {
        type: String,
    },
    StoneType4: {
        type: String,
    },
    StoneWeight4: {
        type: String,
    },
    StoneRate4: {
        type: String,
    },
});
const Temp = mongoose.model('Temp', TempSchema);
module.exports = Temp;
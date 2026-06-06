const Stock = require('../models/stock');
const Env_Variable = require('../models/env_variable');

async function calculatePrice(item) {
    const { value } = await Env_Variable.findOne({ name: 'goldPrice' });
    const goldPrice = +value;
    const goldRate = goldPrice * (item.isKDM ? 1.1 : 1);
    const { retailMultiplier, wastage } = item.purity;
    const metalCost = retailMultiplier * item.netWt * goldRate * (100 + +wastage) / 10000;
    const stonesCost = item.stoneTable.reduce((sum, { ctWeight = 1, sellRate }) => sum + ctWeight * +sellRate, 0);
    item.sellingPrice = Math.round((metalCost + stonesCost) / 1000) * 1000;
}

module.exports.DimossWebsite = async function (req, res) {
    try {
        let stockTable = await Stock.find({
            prefix: { $in: ["66c4c3b4d6873b8ea50b5893", "66c4c3b9d6873b8ea50b6555", "67c2c48cd3604e039791483a"] },
        }).populate("prefix ornament purity stockType stoneTable.type");
        for (let i = 0; i < stockTable.length; i++) {
            await calculatePrice(stockTable[i]);
        }
        return res.json(stockTable);
    } catch (err) {
        console.log('Error in Stock List Page!', err);
        req.flash('error', 'Error in Stock List Page!');
        return res.redirect(req.get('Referrer') || '/');
    }
}
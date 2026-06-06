const mongoose = require('mongoose');
const PuritySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    wholesaleMultiplier: {
        type: Number,
        required: true,
    },
    retailMultiplier: {
        type: Number,
        required: true,
    },
    wastage: {
        type: Number,
        required: true,
    },
});
const Purity = mongoose.model('Purity', PuritySchema);
module.exports = Purity;
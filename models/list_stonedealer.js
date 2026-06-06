const mongoose = require('mongoose');
const StoneDealerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
});
const StoneDealer = mongoose.model('StoneDealer', StoneDealerSchema);
module.exports = StoneDealer;
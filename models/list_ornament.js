const mongoose = require('mongoose');
const OrnamentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
});
const Ornament = mongoose.model('Ornament', OrnamentSchema);
module.exports = Ornament;
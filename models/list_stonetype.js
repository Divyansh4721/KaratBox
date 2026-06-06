const mongoose = require('mongoose');
const StoneTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
});
const StoneType = mongoose.model('StoneType', StoneTypeSchema);
module.exports = StoneType;
const mongoose = require('mongoose');
const BillSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
    },
    amount: {
        type: Number,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
    }],
    totalWt: {
        type: Number,
    },
    goldRate: {
        type: Number,
    },
    totalCash: {
        type: Number,
    },
    stoneTable: [{
        tounch: {
            type: Number,
            required: true,
        },
        labour: {
            type: Number,
            required: true,
        },
        rate: [{
            type: Number,
            required: true,
        }]
    }]
}, {
    timestamps: true
});
const Bill = mongoose.model('Bill', BillSchema);
module.exports = Bill;
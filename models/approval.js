const mongoose = require('mongoose');
const ApprovalSchema = new mongoose.Schema({
    userGave: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userTake: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    approvedDate: {
        type: Date,
        required: true,
    },
    receivedDate: {
        type: Date,
    },
    remark: {
        type: String,
    },
    totalCash: {
        type: Number,
        required: true,
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
        required: true,
    }],
}, {
    timestamps: true
});
const Approval = mongoose.model('Approval', ApprovalSchema);
module.exports = Approval;
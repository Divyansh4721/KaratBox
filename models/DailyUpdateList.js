const mongoose = require('mongoose');
const DailyUpdateListSchema = new mongoose.Schema({
    arrival: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    edit: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    sold: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    deleted: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    totalApproval: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    approvalGive: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    approvalTake: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
    closing: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stock',
    }],
}, {
    timestamps: true
});
const DailyUpdateList = mongoose.model('DailyUpdateList', DailyUpdateListSchema);
module.exports = DailyUpdateList;
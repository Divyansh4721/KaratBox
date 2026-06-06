const mongoose = require('mongoose');
const PermissionSchema = new mongoose.Schema({
    listname: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    available: {
        type: String,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
});
const Permission = mongoose.model('Permission', PermissionSchema);
module.exports = Permission;
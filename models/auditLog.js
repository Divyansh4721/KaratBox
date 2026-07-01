const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        action: {
            type: String,
            required: true,
            enum: ["CREATE", "UPDATE", "DELETE", "LOGIN", "EXPORT"] // Expandable platform-wide
        },
        targetModel: {
            type: String,
            required: true,
            enum: ["Stock", "Customer", "Bill"] // Collection name
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        targetIdentifier: {
            type: String, // Human-readable label (e.g., Stock Index Code, Bill Number)
            required: true
        },
        changes: [
            {
                field: { type: String, required: true },
                oldValue: { type: mongoose.Schema.Types.Mixed }, // Handles strings, numbers, arrays
                newValue: { type: mongoose.Schema.Types.Mixed }
            }
        ],
        remark: {
            type: String,
            trim: true
        },
    },
    {
        timestamps: { createdAt: "timestamp", updatedAt: false } // Only care about creation date
    }
);

// Optional: Indexing for fast lookups in an admin dashboard
AuditLogSchema.index({ targetModel: 1, targetId: 1 });
AuditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
module.exports = AuditLog;
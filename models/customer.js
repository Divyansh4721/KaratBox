const mongoose = require("mongoose");
const CustomerSchema = new mongoose.Schema(
  {
    searchStr: {
      type: String
    },
    name: {
      type: String,
      required: true
    },
    phNum: [
      {
        type: Number,
        required: true
      }
    ],
    address: {
      type: String,
      required: true
    },
    CO: [
      {
        type: String,
        required: true
      }
    ],
    impDates: [
      {
        date: {
          type: Date,
          required: true
        },
        remark: {
          type: String,
          required: true
        }
      }
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    bills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bill",
        required: true
      }
    ],
    approvals: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Approval",
        required: true
      }
    ],
    payments: [
      {
        amount: {
          type: Number
        },
        gold: {
          type: Number
        },
        date: {
          type: Date,
          required: true
        },
        remark: {
          type: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);
const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;

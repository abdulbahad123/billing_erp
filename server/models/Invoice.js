const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    },
    qty: {
        type: Number,
        required: true,
        min: 0,
    },
    unit: {
        type: String,
        default: "pcs",
    },
    salesPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    purchasePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    formula: {
        type: String,
        default: "",
    },
});

const invoiceSchema = new mongoose.Schema(
    {
        invoiceNumber: {
            type: String,
            required: true,
            unique: true,
        },
        customerName: {
            type: String,
            required: true,
            trim: true,
        },
        customerPhone: {
            type: String,
            required: true,
            trim: true,
        },
        items: [invoiceItemSchema],
        subTotal: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {
            type: Number,
            required: true,
            min: 0,
        },
        profit: {
            type: Number,
            required: true,
            default: 0,
        },
        paymentMode: {
            type: String,
            enum: ["Cash", "Card", "UPI"],
            default: "Cash",
        },
        cashier: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Invoice", invoiceSchema);

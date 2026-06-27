const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        purchasePrice: {
            type: Number,
            required: true,
            min: 0,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        category: {
            type: String,
            default: "General",
            trim: true,
        },
        unit: {
            type: String,
            default: "pcs",
            enum: ["pcs", "mtr", "kg", "set", "feet"],
        },
        barcode: {
            type: String,
            default: "",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);

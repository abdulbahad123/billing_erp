const Product = require("../models/Product");

// Get all products (with optional search)
const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query;
        let query = { isActive: true };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }
        if (category && category !== "All") {
            query.category = category;
        }

        const products = await Product.find(query).sort({ name: 1 });
        res.status(200).json({ success: true, products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new product (Admin only)
const createProduct = async (req, res) => {
    try {
        const { name, purchasePrice, price, stock, category, unit, barcode } = req.body;

        if (!name || purchasePrice === undefined || price === undefined) {
            return res.status(400).json({
                success: false,
                message: "Product name, purchase price, and selling price are required",
            });
        }

        const exists = await Product.findOne({ name: name.trim() });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Product with this name already exists",
            });
        }

        const product = await Product.create({
            name: name.trim(),
            purchasePrice,
            price,
            stock: stock || 0,
            category: category || "General",
            unit: unit || "pcs",
            barcode: barcode || "",
        });

        res.status(201).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a product (Admin only)
const updateProduct = async (req, res) => {
    try {
        const { name, purchasePrice, price, stock, category, unit, barcode, isActive } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        if (name) product.name = name.trim();
        if (purchasePrice !== undefined) product.purchasePrice = purchasePrice;
        if (price !== undefined) product.price = price;
        if (stock !== undefined) product.stock = stock;
        if (category) product.category = category;
        if (unit) product.unit = unit;
        if (barcode !== undefined) product.barcode = barcode;
        if (isActive !== undefined) product.isActive = isActive;

        await product.save();
        res.status(200).json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete product (soft delete or hard delete) - Let's do soft delete or direct delete
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
};

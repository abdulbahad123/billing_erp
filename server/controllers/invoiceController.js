const Invoice = require("../models/Invoice");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// Create new invoice
const createInvoice = async (req, res) => {
    try {
        const {
            customerName,
            customerPhone,
            items,
            discount,
            paymentMode,
        } = req.body;

        if (!customerName || !customerPhone || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Customer name, phone, and item list are required",
            });
        }

        // 1. Auto-increment Invoice Number
        const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
        let nextNumber = 1001;
        if (lastInvoice && lastInvoice.invoiceNumber) {
            const lastNum = parseInt(lastInvoice.invoiceNumber, 10);
            if (!isNaN(lastNum)) {
                nextNumber = lastNum + 1;
            }
        }
        const invoiceNumber = String(nextNumber);

        // 2. Process items, calculate profit, subtotal, and update stock
        let subTotal = 0;
        let profit = 0;
        const processedItems = [];

        for (const item of items) {
            let purchasePrice = item.purchasePrice || 0;
            let salesPrice = item.salesPrice || 0;
            let name = item.name;
            let unit = item.unit || "pcs";

            // If product reference is present, fetch and update stock
            if (item.productId) {
                const product = await Product.findById(item.productId);
                if (product) {
                    name = product.name;
                    unit = product.unit;
                    purchasePrice = product.purchasePrice;
                    salesPrice = item.salesPrice || product.price;

                    // Decrement stock
                    product.stock = Math.max(0, product.stock - item.qty);
                    await product.save();
                }
            }

            const amount = salesPrice * item.qty;
            subTotal += amount;
            profit += (salesPrice - purchasePrice) * item.qty;

            processedItems.push({
                name,
                productId: item.productId || null,
                qty: item.qty,
                unit,
                salesPrice,
                purchasePrice,
                amount,
                formula: item.formula || "",
            });
        }

        // Apply discount
        const discAmt = discount || 0;
        const total = Math.max(0, subTotal - discAmt);

        // 3. Auto-save customer details
        let customer = await Customer.findOne({ phone: customerPhone.trim() });
        if (!customer) {
            await Customer.create({
                name: customerName.trim(),
                phone: customerPhone.trim(),
            });
        }

        // 4. Save Invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            items: processedItems,
            subTotal,
            discount: discAmt,
            total,
            profit,
            paymentMode: paymentMode || "Cash",
            cashier: req.user ? req.user._id : null,
        });

        res.status(201).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Retrieve invoice history
const getInvoices = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { invoiceNumber: { $regex: search, $options: "i" } },
                    { customerName: { $regex: search, $options: "i" } },
                    { customerPhone: { $regex: search, $options: "i" } },
                ],
            };
        }

        // Cashiers see all invoices (for prints), sorted latest first
        const invoices = await Invoice.find(query)
            .populate("cashier", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Retrieve single invoice
const getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate("cashier", "name");
        if (!invoice) {
            return res.status(404).json({ success: false, message: "Invoice not found" });
        }
        res.status(200).json({ success: true, invoice });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createInvoice,
    getInvoices,
    getInvoiceById,
};

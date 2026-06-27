const Invoice = require("../models/Invoice");
const Product = require("../models/Product");

// Get dashboard summaries (Admin only)
const getDashboardStats = async (req, res) => {
    try {
        // Total products count
        const totalProducts = await Product.countDocuments();

        // Total invoices count
        const totalInvoices = await Invoice.countDocuments();

        // Total Sales & Profit aggregates
        const aggregates = await Invoice.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$total" },
                    totalProfit: { $sum: "$profit" },
                },
            },
        ]);

        const totalSales = aggregates.length > 0 ? aggregates[0].totalSales : 0;
        const totalProfit = aggregates.length > 0 ? aggregates[0].totalProfit : 0;

        // Low stock products alert (stock < 5)
        const lowStockProducts = await Product.find({ stock: { $lt: 5 }, isActive: true })
            .select("name stock unit")
            .limit(10);

        // Recent Invoices (latest 5)
        const recentInvoices = await Invoice.find()
            .populate("cashier", "name")
            .sort({ createdAt: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            stats: {
                totalSales,
                totalProfit,
                totalProducts,
                totalInvoices,
                lowStockCount: lowStockProducts.length,
                lowStockProducts,
                recentInvoices,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get monthly/daily trend reports (Admin only)
const getSalesReport = async (req, res) => {
    try {
        // Retrieve sales grouped by date for the last 30 days
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);

        const salesTrend = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: "$total" },
                    profit: { $sum: "$profit" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            success: true,
            salesTrend,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getSalesReport,
};

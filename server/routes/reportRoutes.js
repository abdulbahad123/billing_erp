const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getSalesReport,
} = require("../controllers/reportController");
const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get("/dashboard", protect, authorize("admin"), getDashboardStats);
router.get("/sales", protect, authorize("admin"), getSalesReport);

module.exports = router;

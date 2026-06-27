const express = require("express");
const router = express.Router();
const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Retrieve catalog is accessible by cashier & admin
router.get("/", protect, getProducts);

// CRUD modifications are limited to Admins
router.post("/", protect, authorize("admin"), createProduct);
router.put("/:id", protect, authorize("admin"), updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);

module.exports = router;

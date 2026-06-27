const express = require("express");
const router = express.Router();
const {
    createInvoice,
    getInvoices,
    getInvoiceById,
} = require("../controllers/invoiceController");
const protect = require("../middleware/authmiddleware");

router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/:id", protect, getInvoiceById);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getCustomers, createCustomer } = require("../controllers/customerController");
const protect = require("../middleware/authmiddleware");

router.get("/", protect, getCustomers);
router.post("/", protect, createCustomer);

module.exports = router;

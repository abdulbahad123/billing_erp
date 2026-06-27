const express = require("express");

const router = express.Router();

const {
    login,
    register,
    getProfile,
} = require("../controllers/authController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/roleMiddleware");

// Public Route
router.post("/login", login);

// Admin Only
router.post(
    "/register",
    protect,
    authorize("admin"),
    register
);

// Logged User
router.get(
    "/profile",
    protect,
    getProfile
);

module.exports = router;
const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

router.get(
    "/admin",
    protect,
    authorize("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin",
            user: req.user,
        });
    }
);

router.get(
    "/cashier",
    protect,
    authorize("admin", "cashier"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Cashier",
            user: req.user,
        });
    }
);

module.exports = router;
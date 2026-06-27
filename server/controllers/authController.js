const bcrypt = require("bcrypt");
const validator = require("validator");

const User = require("../models/User");
const generateToken = require("../utils/generateTokens");

// --------------------
// Login
// --------------------
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required",
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Account Disabled",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials",
            });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id, user.role);

        res.status(200).json({
            success: true,
            message: "Login Successful",

            token,

            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------
// Register User
// Admin Only
// --------------------
const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            role,
        } = req.body;

        if (
            !name ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory",
            });
        }

        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Email",
            });
        }

        const exists = await User.findOne({
            email,
        });

        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user =
            await User.create({
                name,
                email,
                password: hashedPassword,
                phone,
                role,
            });

        res.status(201).json({
            success: true,
            message: "User Created Successfully",

            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// --------------------
// Current Logged User
// --------------------
const getProfile = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    });
};

module.exports = {
    login,
    register,
    getProfile,
};
require("dotenv").config();

// Force Google DNS to bypass ISP DNS blocking MongoDB SRV records
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");

async function seedAdmin() {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected");

        const adminExists = await User.findOne({
            email: "admin@gmail.com",
        });

        if (adminExists) {
            console.log("Admin already exists.");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("123456", 10);

        const admin = new User({
            name: "Administrator",
            email: "admin@gmail.com",
            password: hashedPassword,
            phone: "9999999999",
            role: "admin",
        });

        await admin.save();

        console.log("Admin Created Successfully");

        process.exit();

    } catch (error) {

        console.log(error);

        process.exit(1);

    }
}

seedAdmin();
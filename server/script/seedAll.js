require("dotenv").config();
const dns = require("dns");

// Bypassing ISP SRV blocks
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/User");
const Product = require("../models/Product");

const sampleProducts = [
    {
        name: "1.5 HP 18 stage lakshmi",
        purchasePrice: 10500,
        price: 12500,
        stock: 15,
        category: "Motors",
        unit: "pcs",
        barcode: "MTR-LAKSHMI-1.5",
    },
    {
        name: "ஓபனல் மோட்டார் 1.5HP (Openwell Motor)",
        purchasePrice: 1500,
        price: 1900,
        stock: 8,
        category: "Motors",
        unit: "pcs",
        barcode: "MTR-OPEN-1.5",
    },
    {
        name: "finolex wire 2.5sqmm",
        purchasePrice: 90,
        price: 115,
        stock: 1200,
        category: "Wires",
        unit: "mtr",
        barcode: "WIR-FINO-2.5",
    },
    {
        name: "HDPE Hose 6kg",
        purchasePrice: 45,
        price: 58,
        stock: 600,
        category: "Hoses",
        unit: "mtr",
        barcode: "HOS-HDPE-6KG",
    },
    {
        name: "போர் மூடி 1\" (Bore Cap)",
        purchasePrice: 220,
        price: 300,
        stock: 25,
        category: "Fittings",
        unit: "pcs",
        barcode: "FIT-BCAP-1",
    },
    {
        name: "போர் கிளம்பு 1\" (Bore Clamp)",
        purchasePrice: 220,
        price: 300,
        stock: 25,
        category: "Fittings",
        unit: "pcs",
        barcode: "FIT-BCLAMP-1",
    },
    {
        name: "UPVC NRV 1\"",
        purchasePrice: 200,
        price: 270,
        stock: 30,
        category: "Fittings",
        unit: "pcs",
        barcode: "FIT-NRV-1",
    },
    {
        name: "இன்சுலேசன் டேப் (Insulation Tape Set)",
        purchasePrice: 140,
        price: 200,
        stock: 50,
        category: "Accessories",
        unit: "set",
        barcode: "ACC-TAPE-SET",
    },
    {
        name: "1\" பெண்டு, கப்ளிங் (PVC Bend & Coupling)",
        purchasePrice: 120,
        price: 160,
        stock: 45,
        category: "Fittings",
        unit: "set",
        barcode: "FIT-BEND-1",
    },
    {
        name: "மஞ்சள் கயிறு 12 mm (Yellow Rope)",
        purchasePrice: 180,
        price: 240,
        stock: 100,
        category: "Accessories",
        unit: "kg",
        barcode: "ACC-ROPE-12MM",
    },
    {
        name: "SS Hose Coller set",
        purchasePrice: 450,
        price: 600,
        stock: 20,
        category: "Fittings",
        unit: "set",
        barcode: "FIT-SS-COLLAR",
    },
];

async function seedAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        // 1. Seed Admin User
        const adminExists = await User.findOne({ email: "admin@gmail.com" });
        if (!adminExists) {
            const hashedAdminPassword = await bcrypt.hash("123456", 10);
            await User.create({
                name: "Admin Manager",
                email: "admin@gmail.com",
                password: hashedAdminPassword,
                phone: "9876543210",
                role: "admin",
            });
            console.log("Admin account created successfully (admin@gmail.com / 123456)");
        } else {
            console.log("Admin account already exists.");
        }

        // 2. Seed Cashier User
        const cashierExists = await User.findOne({ email: "cashier@gmail.com" });
        if (!cashierExists) {
            const hashedCashierPassword = await bcrypt.hash("123456", 10);
            await User.create({
                name: "Tamil Cashier",
                email: "cashier@gmail.com",
                password: hashedCashierPassword,
                phone: "8760076551",
                role: "cashier",
            });
            console.log("Cashier account created successfully (cashier@gmail.com / 123456)");
        } else {
            console.log("Cashier account already exists.");
        }

        // 3. Seed Products
        for (const item of sampleProducts) {
            const productExists = await Product.findOne({ name: item.name });
            if (!productExists) {
                await Product.create(item);
                console.log(`Product seeded: ${item.name}`);
            } else {
                console.log(`Product already exists: ${item.name}`);
            }
        }

        console.log("Database successfully seeded.");
        process.exit();
    } catch (error) {
        console.error("Seeding failed:", error);
        process.exit(1);
    }
}

seedAll();

const Customer = require("../models/Customer");

// Get all customers (with search support by phone or name)
const getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { phone: { $regex: search, $options: "i" } },
                ],
            };
        }

        const customers = await Customer.find(query).sort({ name: 1 });
        res.status(200).json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a customer profile
const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, address } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                success: false,
                message: "Name and phone number are required",
            });
        }

        // Check if customer already exists by phone
        let customer = await Customer.findOne({ phone: phone.trim() });
        if (customer) {
            // Update other fields if provided, or return existing customer
            if (name) customer.name = name;
            if (email) customer.email = email;
            if (address) customer.address = address;
            await customer.save();
            return res.status(200).json({ success: true, customer, message: "Customer profile updated" });
        }

        customer = await Customer.create({
            name: name.trim(),
            phone: phone.trim(),
            email: email || "",
            address: address || "",
        });

        res.status(201).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getCustomers,
    createCustomer,
};

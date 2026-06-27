require("dotenv").config();

// Force Google DNS to bypass ISP DNS blocking MongoDB SRV records
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const app = require("./app");
const connectdb = require("./config/db");
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectdb();
    console.log("database successfull connected");
    console.log(`Server running on ${PORT}`);
});
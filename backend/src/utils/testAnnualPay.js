
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({
    path: path.join(__dirname, "../.env")
});
const applyAnnualPayIncrease = require("../services/annualPayService");


console.log(
    "MONGO_URI:",
    process.env.MONGO_URI ? "FOUND" : "NOT FOUND"
);
const testAnnualPay = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");

        const result = await applyAnnualPayIncrease();

        console.log("Result");
        console.log(result);

        await mongoose.connection.close();
        console.log("MongoDB Connection Closed");
    }
    catch (error) {
        console.error("Test Error", error.message);
        await mongoose.connection.close();
    }
};

testAnnualPay();
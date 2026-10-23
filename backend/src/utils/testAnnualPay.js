const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("../config/db");
const applyAnnualPayIncrease = require("../services/annualPayService");

const testAnnualPay = async () => {
    try {
        console.log("Starting annual pay test...");

        await connectDB();

        const organisationId = process.env.ORGANISATION_ID;

        if (!organisationId) {
            throw new Error("Set ORGANISATION_ID before running the annual pay test");
        }

        const result = await applyAnnualPayIncrease(organisationId);

        console.log("Result:");
        console.log(result);

        await mongoose.connection.close();

        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Test Error:", error.message);
        await mongoose.connection.close();
    }
};

testAnnualPay();

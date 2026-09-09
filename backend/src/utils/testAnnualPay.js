const mongoose = require("mongoose");

const connectDB = require("../config/db");
const applyAnnualPayIncrease = require("../services/annualPayService");


const testAnnualPay = async () => {

    try {

        console.log("Starting annual pay test...");


        // Connect to MongoDB
        await connectDB();


        // Run the annual pay service
        const result = await applyAnnualPayIncrease();


        // Display the result
        console.log("Result:");
        console.log(result);


        // Close MongoDB connection
        await mongoose.connection.close();

        console.log("MongoDB connection closed");


    } catch (error) {

        console.error(
            "Test Error:",
            error.message
        );

    }

};


testAnnualPay();
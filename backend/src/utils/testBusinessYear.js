const mongoose = require("mongoose");
const BusinessYear = require("../models/businessYear");
require("dotenv").config({
    path:"../.env"
});
const createBusinessYear = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB Connected");

        const businessYear = await BusinessYear.create({
            year: "2026/27",
            payIncreaseAmount: 0.20,
            payIncreaseApplied: false,
        });

        console.log("Business Year Created");
        console.log(businessYear);

        await mongoose.connection.close();
    }
    catch (error) {
        console.error("Error:", error);

        await mongoose.connection.close();
    }
}

createBusinessYear()
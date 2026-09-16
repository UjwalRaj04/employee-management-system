const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("../config/db");
const Position = require("../models/Position");

const defaultPositions = [
    { name: "Team Member", pay: 12.71, payPeriod: "hourly" },
    { name: "Team Leader", pay: 13.50, payPeriod: "hourly" },
    { name: "Assistant Manager", pay: 35000, payPeriod: "monthly" },
    { name: "Manager / GM", pay: 45000, payPeriod: "monthly" },
];

const seedPositions = async () => {
    try {
        await connectDB();

        for (const position of defaultPositions) {
            const saved = await Position.findOneAndUpdate(
                { name: position.name },
                { $set: position },
                { upsert: true, returnDocument: "after" }
            );

            console.log("Position ready:", saved.name, saved.pay, saved.payPeriod);
        }

        await mongoose.connection.close();
        console.log("Position seed complete");
    } catch (error) {
        console.error("Position seed error:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

seedPositions();

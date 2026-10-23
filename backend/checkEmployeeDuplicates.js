
require("dotenv").config();

const mongoose = require("mongoose");
const Employee = require("./src/models/Employee");

async function checkEmployeeDuplicates() {
  try {
    // Connect to the MongoDB database configured in .env
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    // Find duplicate email addresses within the same organisation
    const duplicates = await Employee.aggregate([
      {
        $group: {
          _id: {
            organisationId: "$organisationId",
            email: "$email",
          },
          count: { $sum: 1 },
          employeeIds: { $push: "$_id" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]);

    if (duplicates.length === 0) {
      console.log(
        "SUCCESS: No duplicate organisation/email combinations found."
      );
    } else {
      console.log("Duplicate organisation/email combinations found:");
      console.log(JSON.stringify(duplicates, null, 2));
    }
  } catch (error) {
    console.error("Error checking duplicates:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

checkEmployeeDuplicates();


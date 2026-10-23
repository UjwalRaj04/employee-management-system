
require("dotenv").config();

const mongoose = require("mongoose");
const Employee = require("./src/models/Employee");

async function checkEmployees() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    // Find employees whose organisationId is missing or null.
    const employees = await Employee.find({
      $or: [
        { organisationId: { $exists: false } },
        { organisationId: null },
      ],
    })
      .select("_id name email organisationId")
      .lean();

    if (employees.length === 0) {
      console.log(
        "SUCCESS: Every employee has an organisationId."
      );
    } else {
      console.log(
        `Found ${employees.length} employee(s) without an organisationId:`
      );

      console.log(JSON.stringify(employees, null, 2));
    }
  } catch (error) {
    console.error("Error checking employees:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

checkEmployees();


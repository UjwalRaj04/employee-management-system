
require("dotenv").config();

const mongoose = require("mongoose");
const Organisation = require("./src/models/Organisation");

async function checkOrganisations() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    // Read organisations without changing any data.
    const organisations = await Organisation.find({})
      .select("_id name slug")
      .lean();

    console.log(
      "Organisations found:",
      JSON.stringify(organisations, null, 2)
    );
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

checkOrganisations();


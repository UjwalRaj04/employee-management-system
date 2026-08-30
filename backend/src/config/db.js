const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
     console.log("DATABASE:", mongoose.connection.name);

        console.log(
            "COLLECTIONS:",
            (await mongoose.connection.db.listCollections().toArray())
                .map(c => c.name)
        );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
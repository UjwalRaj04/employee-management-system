const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes=require("./routes/employeeRoutes")
const positionRoutes = require("./routes/positionRoutes");
const businessYearRoutes = require("./routes/businessYearRoutes");
const annualPayRoutes = require("./routes/annualPayRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees",employeeRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/business-years", businessYearRoutes);
app.use("/api/annual-pay", annualPayRoutes);
app.use("/api/payroll", payrollRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "ShiftMate API is running",
  });
});

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
    {
        period: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        businessYear: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["generated"],
            default: "generated",
        },
        payslipCount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalGross: {
            type: Number,
            required: true,
            min: 0,
        },
        generatedBy: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const PayrollRun = mongoose.model("PayrollRun", payrollRunSchema);

module.exports = PayrollRun;

const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
    {
        payrollRun: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PayrollRun",
            required: true,
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        employeeName: {
            type: String,
            required: true,
            trim: true,
        },
        employeeEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        position: {
            type: String,
            required: true,
            trim: true,
        },
        period: {
            type: String,
            required: true,
            trim: true,
        },
        businessYear: {
            type: String,
            required: true,
            trim: true,
        },
        payType: {
            type: String,
            enum: ["hourly", "monthly"],
            required: true,
        },
        payRateUsed: {
            type: Number,
            required: true,
            min: 0,
        },
        hoursWorked: {
            type: Number,
            required: true,
            min: 0,
        },
        salary: {
            type: Number,
            required: true,
            min: 0,
        },
        deductions: {
            type: Number,
            default: 0,
            min: 0,
        },
        additions: {
            type: Number,
            default: 0,
            min: 0,
        },
        finalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    {
        timestamps: true,
    }
);

payslipSchema.index({ employee: 1, period: 1 }, { unique: true });

const Payslip = mongoose.model("Payslip", payslipSchema);

module.exports = Payslip;

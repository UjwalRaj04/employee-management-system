const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
    {
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organisation",
            required: true,
            index: true,
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

payrollRunSchema.index(
    { organisationId: 1, period: 1 },
    { unique: true }
);

const PayrollRun = mongoose.model("PayrollRun", payrollRunSchema);

module.exports = PayrollRun;

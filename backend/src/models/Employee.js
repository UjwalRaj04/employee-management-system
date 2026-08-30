const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        position: {
            type: String,
            required: true,
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        joiningDate: {
            type: Date,
            required: true
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
        },

        hourlyRate: {
            type: Number,
            required: true,
            min: 0,
        },

    },
    {
        timestamps: true,
    }
);

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;

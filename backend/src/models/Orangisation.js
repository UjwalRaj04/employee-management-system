const mongoose = require("mongoose");

const organisationSchema = new mongoose.Schema(
    {
        // The registered name of the business using ShiftMate
        name: {
            type: String,
            required: true,
            trim: true,
        },

        // A unique identifier for the organisation
        // Example: coffeehouse, freshbite
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        },

        // Controls whether this organisation can use ShiftMate
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

const Organisation = mongoose.model(
    "Organisation",
    organisationSchema
);

module.exports = Organisation;
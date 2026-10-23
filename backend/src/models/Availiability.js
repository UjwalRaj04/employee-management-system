const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
    {
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organisation",
            required: true,
            index: true,
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        dayOfWeek: {
            type: Number,
            required: true,
            min: 0,
            max: 6,
        },
        isAvailable: {
            type: Boolean,
            default: false,
        },
        startTime: {
            type: String,
            default: "09:00",
            trim: true,
        },
        endTime: {
            type: String,
            default: "17:00",
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

availabilitySchema.index(
    { organisationId: 1, employee: 1, dayOfWeek: 1 },
    { unique: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);

module.exports = Availability;

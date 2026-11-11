const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
    {
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organisation",
            required: true,
            index: true,
        },

        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        tokenHash: {
            type: String,
            required: true,
            unique: true,
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "revoked"],
            default: "pending",
        },

        invitedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        acceptedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Invitation", invitationSchema);
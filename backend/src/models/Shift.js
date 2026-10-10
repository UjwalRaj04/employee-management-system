const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
  {
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: [true, "Branch is required"],
    },

    // Optional so a shift can exist unassigned (an "open shift"),
    // which will matter for the cover shift system later
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    position: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      default: null,
    },

    // Stored as UTC Date values; convert to Europe/London only for display
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },

    endTime: {
      type: Date,
      required: [true, "End time is required"],
      validate: {
        validator: function (value) {
          return !this.startTime || value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },

    breakMinutes: {
      type: Number,
      default: 0,
      min: [0, "Break cannot be negative"],
    },

    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Speeds up the queries we'll run constantly
shiftSchema.index({ employee: 1, startTime: 1 });
shiftSchema.index({ branch: 1, startTime: 1 });

module.exports = mongoose.model("Shift", shiftSchema);
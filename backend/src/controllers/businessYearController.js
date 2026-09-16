const BusinessYear = require("../models/businessYear");
const getBusinessYear = require("../utils/businessYear");

const createBusinessYear = async (req, res) => {
    try {
        const { year, payIncreaseAmount } = req.body;

        if (!year || payIncreaseAmount === undefined) {
            return res.status(400).json({
                message: "Year and payIncreaseAmount are required",
            });
        }

        const existingYear = await BusinessYear.findOne({ year });

        if (existingYear) {
            return res.status(400).json({
                message: "Business year already exists",
            });
        }

        const businessYear = await BusinessYear.create({
            year,
            payIncreaseAmount,
            payIncreaseApplied: false,
        });

        res.status(201).json({
            message: "Business year created successfully",
            businessYear,
        });
    } catch (error) {
        console.error("Create business year error:", error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

const getBusinessYears = async (req, res) => {
    try {
        const businessYears = await BusinessYear.find({}).sort({ year: -1 });

        if (businessYears.length === 0) {
            return res.status(200).json({
                message: "No business years found",
                count: 0,
                businessYears: [],
            });
        }

        res.status(200).json({
            message: "Business years retrieved successfully",
            count: businessYears.length,
            businessYears,
        });
    } catch (error) {
        console.error("Get business years error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const getCurrentBusinessYear = async (req, res) => {
    try {
        const currentYear = getBusinessYear();
        const businessYear = await BusinessYear.findOne({ year: currentYear });

        if (!businessYear) {
            return res.status(404).json({
                message: `Business year ${currentYear} was not found`,
                year: currentYear,
            });
        }

        res.status(200).json({
            message: "Current business year retrieved successfully",
            businessYear,
        });
    } catch (error) {
        console.error("Get current business year error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const updateBusinessYear = async (req, res) => {
    try {
        const updates = req.body;

        const businessYear = await BusinessYear.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!businessYear) {
            return res.status(404).json({
                message: "Business year not found",
            });
        }

        res.status(200).json({
            message: "Business year updated successfully",
            businessYear,
        });
    } catch (error) {
        console.error("Update business year error:", error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

module.exports = {
    createBusinessYear,
    getBusinessYears,
    getCurrentBusinessYear,
    updateBusinessYear,
};

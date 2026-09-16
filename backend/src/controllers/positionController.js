const Position = require("../models/Position");

const createPosition = async (req, res) => {
    try {
        const { name, pay, payPeriod } = req.body;

        if (!name || pay === undefined || !payPeriod) {
            return res.status(400).json({
                message: "Name, pay and payPeriod are required",
            });
        }

        const existingPosition = await Position.findOne({ name });

        if (existingPosition) {
            return res.status(400).json({
                message: "Position with this name already exists",
            });
        }

        const position = await Position.create({
            name,
            pay,
            payPeriod,
        });

        res.status(201).json({
            message: "Position created successfully",
            position,
        });
    } catch (error) {
        console.error("Create position error:", error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

const getPositions = async (req, res) => {
    try {
        const positions = await Position.find({});

        if (positions.length === 0) {
            return res.status(200).json({
                message: "No positions found",
                count: 0,
                positions: [],
            });
        }

        res.status(200).json({
            message: "Positions retrieved successfully",
            count: positions.length,
            positions,
        });
    } catch (error) {
        console.error("Get positions error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const getPositionById = async (req, res) => {
    try {
        const position = await Position.findById(req.params.id);

        if (!position) {
            return res.status(404).json({
                message: "Position not found",
            });
        }

        res.status(200).json({
            message: "Position retrieved successfully",
            position,
        });
    } catch (error) {
        console.error("Get position by ID error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const updatePosition = async (req, res) => {
    try {
        const updates = req.body;

        const position = await Position.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!position) {
            return res.status(404).json({
                message: "Position not found",
            });
        }

        res.status(200).json({
            message: "Position updated successfully",
            position,
        });
    } catch (error) {
        console.error("Update position error:", error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

const deletePosition = async (req, res) => {
    try {
        const position = await Position.findByIdAndDelete(req.params.id);

        if (!position) {
            return res.status(404).json({
                message: "Position not found",
            });
        }

        res.status(200).json({
            message: "Position deleted successfully",
            position,
        });
    } catch (error) {
        console.error("Delete position error:", error);
        res.status(500).json({
            message: "Server Error",
        });
    }
};

module.exports = {
    createPosition,
    getPositions,
    getPositionById,
    updatePosition,
    deletePosition,
};

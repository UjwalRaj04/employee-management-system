const Position = require("../models/Position");
const { getOrganisationId } = require("../utils/organisationContext");

const createPosition = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const { name, pay, payPeriod } = req.body;

        if (!name || pay === undefined || !payPeriod) {
            return res.status(400).json({
                message: "Name, pay and payPeriod are required",
            });
        }

        const existingPosition = await Position.findOne({
            name,
            organisationId,
        });

        if (existingPosition) {
            return res.status(400).json({
                message: "Position with this name already exists",
            });
        }

        const position = await Position.create({
            organisationId,
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

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Position with this name already exists",
            });
        }

        res.status(500).json({
            message: "Server Error",
        });
    }
};

const getPositions = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const positions = await Position.find({ organisationId });

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
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const position = await Position.findOne({
            _id: req.params.id,
            organisationId,
        });

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
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const updates = { ...req.body };
        delete updates.organisationId;

        const position = await Position.findOneAndUpdate(
            {
                _id: req.params.id,
                organisationId,
            },
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

        if (error.code === 11000) {
            return res.status(409).json({
                message: "Position with this name already exists",
            });
        }

        res.status(500).json({
            message: "Server Error",
        });
    }
};

const deletePosition = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const position = await Position.findOneAndDelete({
            _id: req.params.id,
            organisationId,
        });

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

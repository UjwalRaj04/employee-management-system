const Shift = require("../models/Shift");
const { getOrganisationId } = require("../utils/organisationContext");
const ClientError = require("../utils/clientError");
const {
    populateShift,
    buildShiftPayload,
    assertAssignableEmployee,
} = require("../services/shiftService");
const {
    parseIsoDate,
    parseDateParam,
    mondayOfWeek,
    addDays,
    startOfLondonDayUtc,
} = require("../utils/shiftTime");
const { findEmployeeByUser } = require("../utils/tenantResources");

const handleShiftError = (res, error, label) => {
    if (error instanceof ClientError) {
        return res.status(error.status).json({
            message: error.message,
        });
    }

    if (error.name === "ValidationError") {
        return res.status(400).json({
            message: "Shift validation failed",
            errors: Object.values(error.errors).map((item) => item.message),
        });
    }

    if (error.name === "CastError") {
        return res.status(400).json({
            message: "Invalid shift ID or field value",
        });
    }

    if (
        error.message &&
        /YYYY-MM-DD|must be a valid date|is required/i.test(error.message)
    ) {
        return res.status(400).json({
            message: error.message,
        });
    }

    console.error(`${label}:`, error);

    return res.status(500).json({
        message: "Server error",
    });
};

const findOwnedShift = async (organisationId, shiftId) => {
    const shift = await Shift.findOne({
        _id: shiftId,
        organisationId,
    });

    if (!shift) {
        throw new ClientError("Shift not found", 404);
    }

    return shift;
};

const createShift = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const payload = await buildShiftPayload({
            organisationId,
            body: req.body,
            createdBy: req.user.id,
        });

        const shift = await Shift.create(payload);
        const populated = await populateShift(Shift.findById(shift._id));

        return res.status(201).json({
            message: "Shift created successfully",
            shift: populated,
        });
    } catch (error) {
        return handleShiftError(res, error, "Create shift error");
    }
};

const listShifts = async (req, res, extraQuery = {}) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const query = {
            organisationId,
            ...extraQuery,
        };

        if (req.query.branch) {
            query.branch = req.query.branch;
        }

        if (req.query.employee && extraQuery.employee === undefined) {
            query.employee = req.query.employee;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (!query.startTime && (req.query.from || req.query.to)) {
            query.startTime = {};

            if (req.query.from) {
                query.startTime.$gte = parseDateParam(req.query.from, "from");
            }

            if (req.query.to) {
                query.startTime.$lte = parseDateParam(req.query.to, "to");
            }
        }

        const shifts = await populateShift(
            Shift.find(query).sort({ startTime: 1 })
        );

        return res.status(200).json({
            message:
                shifts.length === 0
                    ? "No shifts found"
                    : "Shifts retrieved successfully",
            count: shifts.length,
            shifts,
        });
    } catch (error) {
        return handleShiftError(res, error, "List shifts error");
    }
};

const getShifts = (req, res) => listShifts(req, res);

const getDailySchedule = async (req, res) => {
    try {
        const date = parseIsoDate(req.query.date, "date");
        const from = startOfLondonDayUtc(date);
        const to = startOfLondonDayUtc(addDays(date, 1));

        return listShifts(req, res, {
            startTime: { $gte: from, $lt: to },
        });
    } catch (error) {
        return handleShiftError(res, error, "Daily schedule error");
    }
};

const getWeeklySchedule = async (req, res) => {
    try {
        const weekStart = mondayOfWeek(
            parseIsoDate(req.query.weekStart, "weekStart")
        );
        const from = startOfLondonDayUtc(weekStart);
        const to = startOfLondonDayUtc(addDays(weekStart, 7));

        return listShifts(req, res, {
            startTime: { $gte: from, $lt: to },
        });
    } catch (error) {
        return handleShiftError(res, error, "Weekly schedule error");
    }
};

const getMyShifts = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const employee = await findEmployeeByUser(req);

        return listShifts(req, res, {
            employee: employee._id,
        });
    } catch (error) {
        return handleShiftError(res, error, "Get my shifts error");
    }
};

const getShiftById = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const shift = await populateShift(
            Shift.findOne({
                _id: req.params.id,
                organisationId,
            })
        );

        if (!shift) {
            return res.status(404).json({
                message: "Shift not found",
            });
        }

        return res.status(200).json({
            message: "Shift retrieved successfully",
            shift,
        });
    } catch (error) {
        return handleShiftError(res, error, "Get shift error");
    }
};

const updateShift = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const existingShift = await findOwnedShift(
            organisationId,
            req.params.id
        );

        if (existingShift.status === "cancelled") {
            throw new ClientError("Cancelled shifts cannot be edited", 400);
        }

        const payload = await buildShiftPayload({
            organisationId,
            body: req.body,
            createdBy: existingShift.createdBy,
            existingShift,
        });

        Object.assign(existingShift, payload);
        await existingShift.save();

        const shift = await populateShift(Shift.findById(existingShift._id));

        return res.status(200).json({
            message: "Shift updated successfully",
            shift,
        });
    } catch (error) {
        return handleShiftError(res, error, "Update shift error");
    }
};

const assignShift = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const existingShift = await findOwnedShift(
            organisationId,
            req.params.id
        );

        if (existingShift.status !== "scheduled") {
            throw new ClientError(
                "Only scheduled shifts can be assigned",
                400
            );
        }

        if (!req.body.employee) {
            throw new ClientError("Employee is required", 400);
        }

        await assertAssignableEmployee({
            organisationId,
            employeeId: req.body.employee,
            branchId: existingShift.branch,
            startTime: existingShift.startTime,
            endTime: existingShift.endTime,
            excludeShiftId: existingShift._id,
        });

        existingShift.employee = req.body.employee;
        await existingShift.save();

        const shift = await populateShift(Shift.findById(existingShift._id));

        return res.status(200).json({
            message: "Employee assigned to shift",
            shift,
        });
    } catch (error) {
        return handleShiftError(res, error, "Assign shift error");
    }
};

const cancelShift = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const existingShift = await findOwnedShift(
            organisationId,
            req.params.id
        );

        if (existingShift.status === "cancelled") {
            throw new ClientError("Shift is already cancelled", 400);
        }

        existingShift.status = "cancelled";
        await existingShift.save();

        const shift = await populateShift(Shift.findById(existingShift._id));

        return res.status(200).json({
            message: "Shift cancelled successfully",
            shift,
        });
    } catch (error) {
        return handleShiftError(res, error, "Cancel shift error");
    }
};

module.exports = {
    createShift,
    getShifts,
    getDailySchedule,
    getWeeklySchedule,
    getMyShifts,
    getShiftById,
    updateShift,
    assignShift,
    cancelShift,
};

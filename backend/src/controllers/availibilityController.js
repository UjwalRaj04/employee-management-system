const Availability = require("../models/Availability");
const { getOrganisationId } = require("../utils/organisationContext");
const ClientError = require("../utils/clientError");
const { parseHHMM } = require("../utils/shiftTime");
const {
    findOrganisationEmployee,
    findEmployeeByUser,
} = require("../utils/tenantResources");

const handleError = (res, error, label) => {
    if (error instanceof ClientError) {
        return res.status(error.status).json({
            message: error.message,
        });
    }

    console.error(`${label}:`, error);

    return res.status(500).json({
        message: "Server error",
    });
};

const normaliseDays = (days) => {
    if (!Array.isArray(days) || days.length === 0) {
        throw new ClientError("Availability days are required", 400);
    }

    const seen = new Set();

    return days.map((day) => {
        const dayOfWeek = Number(day.dayOfWeek);

        if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6) {
            throw new ClientError("dayOfWeek must be between 0 (Sunday) and 6", 400);
        }

        if (seen.has(dayOfWeek)) {
            throw new ClientError("Each weekday can only be supplied once", 400);
        }

        seen.add(dayOfWeek);

        const isAvailable = Boolean(day.isAvailable);

        if (!isAvailable) {
            return {
                dayOfWeek,
                isAvailable: false,
                startTime: "00:00",
                endTime: "00:00",
            };
        }

        parseHHMM(day.startTime);
        parseHHMM(day.endTime);

        if (parseHHMM(day.endTime) <= parseHHMM(day.startTime)) {
            throw new ClientError(
                "Availability end time must be after start time",
                400
            );
        }

        return {
            dayOfWeek,
            isAvailable: true,
            startTime: day.startTime,
            endTime: day.endTime,
        };
    });
};

const saveAvailability = async ({ organisationId, employeeId, days }) => {
    const normalised = normaliseDays(days);

    await Availability.deleteMany({
        organisationId,
        employee: employeeId,
    });

    const records = await Availability.insertMany(
        normalised.map((day) => ({
            organisationId,
            employee: employeeId,
            ...day,
        }))
    );

    return records.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
};

const getMyAvailability = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const employee = await findEmployeeByUser(req);
        const availability = await Availability.find({
            organisationId,
            employee: employee._id,
        }).sort({ dayOfWeek: 1 });

        return res.status(200).json({
            message:
                availability.length === 0
                    ? "No availability has been set"
                    : "Availability retrieved successfully",
            employee: employee._id,
            availability,
        });
    } catch (error) {
        return handleError(res, error, "Get my availability error");
    }
};

const updateMyAvailability = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const employee = await findEmployeeByUser(req);
        const availability = await saveAvailability({
            organisationId,
            employeeId: employee._id,
            days: req.body.days,
        });

        return res.status(200).json({
            message: "Availability updated successfully",
            employee: employee._id,
            availability,
        });
    } catch (error) {
        return handleError(res, error, "Update my availability error");
    }
};

const getEmployeeAvailability = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const employee = await findOrganisationEmployee(
            organisationId,
            req.params.employeeId
        );

        const availability = await Availability.find({
            organisationId,
            employee: employee._id,
        }).sort({ dayOfWeek: 1 });

        return res.status(200).json({
            message:
                availability.length === 0
                    ? "No availability has been set"
                    : "Availability retrieved successfully",
            employee: employee._id,
            availability,
        });
    } catch (error) {
        return handleError(res, error, "Get employee availability error");
    }
};

module.exports = {
    getMyAvailability,
    updateMyAvailability,
    getEmployeeAvailability,
};

const Shift = require("../models/Shift");
const Availability = require("../models/Availability");
const ClientError = require("../utils/clientError");
const {
    availabilityCoversShift,
    parseDateParam,
} = require("../utils/shiftTime");
const {
    findOrganisationBranch,
    findOrganisationEmployee,
    findOrganisationPosition,
} = require("../utils/tenantResources");

const populateShift = (query) =>
    query
        .populate("branch", "name city status")
        .populate("employee", "name email position status branch")
        .populate("position", "name pay payPeriod");

const findConflictingShift = async ({
    organisationId,
    employeeId,
    startTime,
    endTime,
    excludeShiftId,
}) => {
    if (!employeeId) {
        return null;
    }

    const query = {
        organisationId,
        employee: employeeId,
        status: "scheduled",
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
    };

    if (excludeShiftId) {
        query._id = { $ne: excludeShiftId };
    }

    return Shift.findOne(query);
};

const assertNoConflict = async (params) => {
    const conflict = await findConflictingShift(params);

    if (conflict) {
        throw new ClientError(
            "This employee already has a conflicting scheduled shift",
            409
        );
    }
};

const assertAvailability = async ({
    organisationId,
    employeeId,
    startTime,
    endTime,
}) => {
    if (!employeeId) {
        return;
    }

    const slots = await Availability.find({
        organisationId,
        employee: employeeId,
    });

    if (slots.length === 0) {
        throw new ClientError(
            "Employee has not set availability for this week",
            400
        );
    }

    if (!availabilityCoversShift(slots, startTime, endTime)) {
        throw new ClientError(
            "Shift is outside the employee's availability",
            400
        );
    }
};

const assertAssignableEmployee = async ({
    organisationId,
    employeeId,
    branchId,
    startTime,
    endTime,
    excludeShiftId,
}) => {
    if (!employeeId) {
        return null;
    }

    const employee = await findOrganisationEmployee(
        organisationId,
        employeeId
    );

    if (employee.status !== "active") {
        throw new ClientError("Only active employees can be assigned to shifts", 400);
    }

    if (employee.branch && String(employee.branch) !== String(branchId)) {
        throw new ClientError(
            "Employee is assigned to a different branch",
            400
        );
    }

    await assertNoConflict({
        organisationId,
        employeeId: employee._id,
        startTime,
        endTime,
        excludeShiftId,
    });

    await assertAvailability({
        organisationId,
        employeeId: employee._id,
        startTime,
        endTime,
    });

    return employee;
};

const resolveShiftTimes = (startTime, endTime) => {
    const start = parseDateParam(startTime, "Start time");
    const end = parseDateParam(endTime, "End time");

    if (end <= start) {
        throw new ClientError("End time must be after start time", 400);
    }

    const durationHours = (end - start) / (1000 * 60 * 60);

    if (durationHours > 24) {
        throw new ClientError("A shift cannot be longer than 24 hours", 400);
    }

    return { start, end };
};

const buildShiftPayload = async ({
    organisationId,
    body,
    createdBy,
    existingShift,
}) => {
    const branchId = body.branch || existingShift?.branch;
    const startTime = body.startTime || existingShift?.startTime;
    const endTime = body.endTime || existingShift?.endTime;

    if (!branchId) {
        throw new ClientError("Branch is required", 400);
    }

    const branch = await findOrganisationBranch(organisationId, branchId);

    if (branch.status !== "active" && !existingShift) {
        throw new ClientError("Shifts can only be created at an active branch", 400);
    }

    const { start, end } = resolveShiftTimes(startTime, endTime);

    const employeeId =
        body.employee === undefined
            ? existingShift?.employee || null
            : body.employee || null;

    await assertAssignableEmployee({
        organisationId,
        employeeId,
        branchId: branch._id,
        startTime: start,
        endTime: end,
        excludeShiftId: existingShift?._id,
    });

    const positionInput =
        body.position === undefined
            ? existingShift?.position || body.positionId
            : body.position || body.positionId || null;

    const position = await findOrganisationPosition(
        organisationId,
        positionInput
    );

    return {
        organisationId,
        branch: branch._id,
        employee: employeeId || null,
        position: position?._id || null,
        startTime: start,
        endTime: end,
        breakMinutes: body.breakMinutes ?? existingShift?.breakMinutes ?? 0,
        notes: body.notes ?? existingShift?.notes,
        createdBy: createdBy || existingShift?.createdBy,
    };
};

module.exports = {
    populateShift,
    findConflictingShift,
    assertNoConflict,
    assertAvailability,
    assertAssignableEmployee,
    buildShiftPayload,
};

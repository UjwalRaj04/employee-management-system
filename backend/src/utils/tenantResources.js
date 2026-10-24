const mongoose = require("mongoose");
const Branch = require("../models/Branch");
const Employee = require("../models/Employee");
const Position = require("../models/Position");
const ClientError = require("./clientError");

const requireValidId = (id, label) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new ClientError(`Invalid ${label}`, 400);
    }
};

const findOrganisationBranch = async (organisationId, branchId) => {
    requireValidId(branchId, "branch ID");

    const branch = await Branch.findOne({
        _id: branchId,
        organisationId,
    });

    if (!branch) {
        throw new ClientError("Branch not found", 404);
    }

    return branch;
};

const findOrganisationEmployee = async (organisationId, employeeId) => {
    requireValidId(employeeId, "employee ID");

    const employee = await Employee.findOne({
        _id: employeeId,
        organisationId,
    });

    if (!employee) {
        throw new ClientError("Employee not found", 404);
    }

    return employee;
};

const findOrganisationPosition = async (organisationId, positionValue) => {
    if (!positionValue) {
        return null;
    }

    const query = mongoose.isValidObjectId(positionValue)
        ? { _id: positionValue, organisationId }
        : { name: positionValue, organisationId };

    const position = await Position.findOne(query);

    if (!position) {
        throw new ClientError("Invalid position. No pay configuration found", 400);
    }

    return position;
};

const findEmployeeByUser = async (req) => {
    const employee = await Employee.findOne({
        organisationId: req.organisationId,
        email: req.user.email,
    });

    if (!employee) {
        throw new ClientError(
            "No employee record is linked to this user account",
            404
        );
    }

    return employee;
};

module.exports = {
    requireValidId,
    findOrganisationBranch,
    findOrganisationEmployee,
    findOrganisationPosition,
    findEmployeeByUser,
};

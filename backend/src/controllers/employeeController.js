const Employee = require("../models/Employee");
const Position = require("../models/Position");
const User = require("../models/User");
const Invitation = require("../models/Invitation");

const { getOrganisationId } = require("../utils/organisationContext");

const {
    findOrganisationBranch,
} = require("../utils/tenantResources");

const ClientError = require("../utils/clientError");

const {
    generateInvitationToken,
    hashInvitationToken,
    getInvitationExpiry,
} = require("../services/invitationService");

const {
    sendInvitationEmail,
} = require("../services/emailService");

// ==========================================
// 1. CREATE EMPLOYEE
// ==========================================

const createEmployee = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const {
            name,
            email,
            phone,
            position,
            location,
            joiningDate,
            dateOfBirth,
            branch,
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !position ||
            !location ||
            !joiningDate ||
            !dateOfBirth
        ) {
            return res.status(400).json({
                message: "All employee fields are required",
            });
        }

        // Normalise email before searching or saving.
        const normalisedEmail = email.trim().toLowerCase();

        // Check for an existing employee within this organisation.
        const existingEmployee = await Employee.findOne({
            email: normalisedEmail,
            organisationId,
        });

        if (existingEmployee) {
            return res.status(409).json({
                message: "Employee with this email already exists",
            });
        }

        // Find the configured position and its pay details.
        const positionDetails = await Position.findOne({
            name: position,
            organisationId,
        });

        if (!positionDetails) {
            return res.status(400).json({
                message: "Invalid position. No pay configuration found",
            });
        }

        let branchId;

        if (branch) {
            const branchDetails = await findOrganisationBranch(
                organisationId,
                branch
            );

            branchId = branchDetails._id;
        }

        // Organisation ID comes from verified tenant context.
        const employee = await Employee.create({
            organisationId,
            name: name.trim(),
            email: normalisedEmail,
            phone,
            position: positionDetails.name,
            location,
            joiningDate,
            dateOfBirth,
            pay: positionDetails.pay,
            payPeriod: positionDetails.payPeriod,
            branch: branchId,
        });

        return res.status(201).json({
            message: "Employee created successfully",
            employee,
        });

    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(error.status).json({
                message: error.message,
            });
        }

        console.error("Create employee error:", error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: "An employee with this email already exists",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Employee validation failed",
                errors: Object.values(error.errors).map(
                    (item) => item.message
                ),
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ==========================================
// 2. GET ALL EMPLOYEES
// ==========================================

const getEmployees = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const query = { organisationId };

        if (req.query.branch) {
            query.branch = req.query.branch;
        }

        const employees = await Employee.find(query).populate(
            "branch",
            "name city status"
        );

        return res.status(200).json({
            message:
                employees.length === 0
                    ? "No employees found for this organisation"
                    : "Employees retrieved successfully",

            count: employees.length,
            employees,
        });

    } catch (error) {
        console.error("Get employees error:", error);

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ==========================================
// 3. GET EMPLOYEE BY ID
// ==========================================

const getEmployeesById = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const employee = await Employee.findOne({
            _id: req.params.id,
            organisationId,
        }).populate("branch", "name city status");

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            message: "Employee retrieved successfully",
            employee,
        });

    } catch (error) {
        console.error("Get employee by ID error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid employee ID",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ==========================================
// 4. UPDATE EMPLOYEE
// ==========================================

const updateEmployee = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        // Only allow approved fields to be updated.
        // Clients cannot change organisationId, pay or payPeriod directly.
        const allowedFields = [
            "name",
            "email",
            "phone",
            "position",
            "location",
            "joiningDate",
            "dateOfBirth",
            "status",
            "branch",
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (
                Object.prototype.hasOwnProperty.call(req.body, field)
            ) {
                updates[field] = req.body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                message: "No valid employee fields supplied for update",
            });
        }

        // Normalise email if it is being updated.
        if (typeof updates.email === "string") {
            updates.email = updates.email.trim().toLowerCase();

            const duplicateEmployee = await Employee.findOne({
                email: updates.email,
                organisationId,
                _id: { $ne: req.params.id },
            });

            if (duplicateEmployee) {
                return res.status(409).json({
                    message:
                        "Another employee in this organisation uses this email",
                });
            }
        }

        // Recalculate pay from the configured position.
        if (updates.position) {
            const positionDetails = await Position.findOne({
                name: updates.position,
                organisationId,
            });

            if (!positionDetails) {
                return res.status(400).json({
                    message:
                        "Invalid position. No pay configuration found",
                });
            }

            updates.position = positionDetails.name;
            updates.pay = positionDetails.pay;
            updates.payPeriod = positionDetails.payPeriod;
        }

        // Validate branch ownership.
        if (Object.prototype.hasOwnProperty.call(updates, "branch")) {
            if (updates.branch === null || updates.branch === "") {
                updates.branch = null;
            } else {
                const branchDetails = await findOrganisationBranch(
                    organisationId,
                    updates.branch
                );

                updates.branch = branchDetails._id;
            }
        }

        // Both employee ID and organisation ID are required.
        const employee = await Employee.findOneAndUpdate(
            {
                _id: req.params.id,
                organisationId,
            },
            {
                $set: updates,
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            message: "Employee updated successfully",
            employee,
        });

    } catch (error) {
        if (error instanceof ClientError) {
            return res.status(error.status).json({
                message: error.message,
            });
        }

        console.error("Update employee error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid employee ID or field value",
            });
        }

        if (error.name === "ValidationError") {
            return res.status(400).json({
                message: "Employee validation failed",
                errors: Object.values(error.errors).map(
                    (item) => item.message
                ),
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "An employee with this email already exists",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ==========================================
// 5. DELETE EMPLOYEE
// ==========================================

const deleteEmployee = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    try {
        const employee = await Employee.findOneAndDelete({
            _id: req.params.id,
            organisationId,
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            message: "Employee deleted successfully",
            employee,
        });

    } catch (error) {
        console.error("Delete employee error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid employee ID",
            });
        }

        return res.status(500).json({
            message: "Server error",
        });
    }
};

// ==========================================
// 6. INVITE EMPLOYEE
// ==========================================

const inviteEmployee = async (req, res) => {
    const organisationId = getOrganisationId(req, res);

    if (!organisationId) {
        return;
    }

    let invitation;

    try {
        // Find employee within the authenticated organisation.
        const employee = await Employee.findOne({
            _id: req.params.id,
            organisationId,
        });

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }

        // Only active employees can receive invitations.
        if (employee.status !== "active") {
            return res.status(400).json({
                message: "Cannot invite an inactive employee",
            });
        }

        // Check whether a user account already exists.
        const existingUser = await User.findOne({
            email: employee.email,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account already exists for this email address",
            });
        }

        // Generate a secure random invitation token.
        const token = generateInvitationToken();

        // Store only the SHA-256 hash in MongoDB.
        const tokenHash = hashInvitationToken(token);

        // Set invitation expiry.
        const expiresAt = getInvitationExpiry();

        // Create invitation record.
        invitation = await Invitation.create({
            organisationId,
            employeeId: employee._id,
            email: employee.email,
            tokenHash,
            expiresAt,
            invitedBy: req.user.id,
        });

        // Send invitation email.
        const emailResult = await sendInvitationEmail({
            to: employee.email,
            invitedByName: req.user.name,
            organisationName:
                req.organisation?.name || "your organisation",
            token,
            expiresInHours: 24,
        });

        // Handle email delivery failure.
        if (!emailResult.success) {
            invitation.status = "revoked";
            await invitation.save();

            return res.status(502).json({
                message: "Unable to send employee invitation email.",
                emailError: emailResult.message,
            });
        }

        // Revoke older pending invitations only after
        // the new invitation email has been accepted by SMTP.
        await Invitation.updateMany(
            {
                organisationId,
                employeeId: employee._id,
                status: "pending",
                _id: { $ne: invitation._id },
            },
            {
                $set: {
                    status: "revoked",
                },
            }
        );

        return res.status(200).json({
            message: "Employee invitation sent successfully",

            invitation: {
                id: invitation._id,
                employeeId: employee._id,
                email: employee.email,
                expiresAt: invitation.expiresAt,
                status: invitation.status,
            },
        });

    } catch (error) {
        console.error("Invite employee error:", error);

        // Revoke the newly created invitation if processing fails.
        if (invitation && invitation.status === "pending") {
            try {
                invitation.status = "revoked";
                await invitation.save();
            } catch (saveError) {
                console.error(
                    "Failed to revoke invitation:",
                    saveError.message
                );
            }
        }

        if (error instanceof ClientError) {
            return res.status(error.status).json({
                message: error.message,
            });
        }

        if (error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid employee ID",
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "A duplicate invitation record was detected",
            });
        }

        return res.status(500).json({
            message: "Server error while inviting employee",
        });
    }
};

// ==========================================
// 7. EXPORT CONTROLLERS
// ==========================================

module.exports = {
    createEmployee,
    getEmployees,
    getEmployeesById,
    updateEmployee,
    deleteEmployee,
    inviteEmployee,
};
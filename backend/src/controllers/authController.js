const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const Employee = require("../models/Employee");
const Invitation = require("../models/Invitation");

const {
    hashInvitationToken,
} = require("../services/invitationService");


// ==========================================
// PUBLIC REGISTRATION (DISABLED)
// ==========================================

const registerUser = async (req, res) => {
    return res.status(403).json({
        message:
            "Public user registration is disabled. Register an organisation or request an invitation from your organisation administrator.",
    });
};


// ==========================================
// USER LOGIN
// ==========================================

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        if (user.role !== "platformAdmin" && !user.organisationId) {
            return res.status(403).json({
                message: "Your account is not associated with an organisation",
            });
        }

        const organisationId = user.organisationId
            ? user.organisationId.toString()
            : null;

        const token = jwt.sign(
            {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organisationId,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organisationId,
            },
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};


// ==========================================
// ACCEPT EMPLOYEE INVITATION
// ==========================================

const acceptInvitation = async (req, res) => {
    const { token, password } = req.body;

    // Validate required fields
    if (!token || !password) {
        return res.status(400).json({
            message: "Invitation token and password are required",
        });
    }

    // Validate token
    if (typeof token !== "string" || token.length > 200) {
        return res.status(400).json({
            message: "Invalid invitation token",
        });
    }

    // Validate password
    if (typeof password !== "string" || password.length < 6) {
        return res.status(400).json({
            message: "Password must contain at least 6 characters",
        });
    }

    const session = await mongoose.startSession();

    try {
        const tokenHash = hashInvitationToken(token);

        let createdUser = null;

        // Use a transaction so the invitation and user account
        // are updated together.
        await session.withTransaction(async () => {

            // Find a valid pending invitation
            const invitation = await Invitation.findOne({
                tokenHash,
                status: "pending",
                expiresAt: { $gt: new Date() },
            }).session(session);

            if (!invitation) {
                const error = new Error(
                    "This invitation is invalid, expired, or has already been used"
                );
                error.statusCode = 400;
                throw error;
            }

            // Find the employee linked to this invitation
            const employee = await Employee.findOne({
                _id: invitation.employeeId,
                organisationId: invitation.organisationId,
            }).session(session);

            if (!employee) {
                const error = new Error(
                    "The employee record associated with this invitation could not be found"
                );
                error.statusCode = 404;
                throw error;
            }

            // Employee must still be active
            if (employee.status !== "active") {
                const error = new Error(
                    "Your employee account is inactive. Please contact your administrator."
                );
                error.statusCode = 403;
                throw error;
            }

            // Ensure the employee email has not changed
            if (
                employee.email.toLowerCase() !==
                invitation.email.toLowerCase()
            ) {
                const error = new Error(
                    "The employee email does not match this invitation"
                );
                error.statusCode = 400;
                throw error;
            }

            // Check whether an account already exists
            const existingUser = await User.findOne({
                email: invitation.email,
            }).session(session);

            if (existingUser) {
                const error = new Error(
                    "An account already exists with this email address"
                );
                error.statusCode = 409;
                throw error;
            }

            // Securely hash the employee's password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Mark invitation as accepted.
            // The conditional update prevents reuse of the same invitation.
            const updatedInvitation = await Invitation.updateOne(
                {
                    _id: invitation._id,
                    status: "pending",
                    expiresAt: { $gt: new Date() },
                },
                {
                    $set: {
                        status: "accepted",
                        acceptedAt: new Date(),
                    },
                },
                { session }
            );

            if (updatedInvitation.modifiedCount !== 1) {
                const error = new Error(
                    "This invitation has already been used or expired"
                );
                error.statusCode = 400;
                throw error;
            }

            // Create the employee's login account
            const users = await User.create(
                [
                    {
                        name: employee.name,
                        email: invitation.email,
                        password: hashedPassword,
                        role: "employee",
                        organisationId: invitation.organisationId,
                        status: "active",
                    },
                ],
                { session }
            );

            createdUser = users[0];
        });

        return res.status(201).json({
            message: "Invitation accepted successfully. You can now log in to ShiftMate.",
            user: {
                id: createdUser._id,
                name: createdUser.name,
                email: createdUser.email,
                role: createdUser.role,
                organisationId: createdUser.organisationId,
            },
        });

    } catch (error) {
        console.error("Accept invitation error:", error);

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message,
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account already exists with this email address",
            });
        }

        return res.status(500).json({
            message: "Unable to accept invitation. Please try again.",
        });

    } finally {
        await session.endSession();
    }
};


// ==========================================
// GET AUTHENTICATED USER PROFILE
// ==========================================

const getProfile = (req, res) => {
    res.status(200).json({
        message: "You are authenticated successfully",
        user: {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            organisationId: req.user.organisationId,
        },
    });
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    registerUser,
    loginUser,
    acceptInvitation,
    getProfile,
};
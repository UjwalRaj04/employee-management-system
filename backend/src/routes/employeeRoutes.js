const express = require("express");

const {
    createEmployee,
    getEmployees,
    getEmployeesById,
    updateEmployee,
    deleteEmployee,
    inviteEmployee,
} = require("../controllers/employeeController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

// ==========================================
// EMPLOYEE ROUTES
// ==========================================

// Create employee
router.post(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    createEmployee
);

// Get all employees
router.get(
    "/",
    protect,
    requireOrganisationContext,
    getEmployees
);

// Get employee by ID
router.get(
    "/:id",
    protect,
    requireOrganisationContext,
    getEmployeesById
);

// Update employee
router.put(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    updateEmployee
);

// Delete employee
router.delete(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    deleteEmployee
);

// ==========================================
// EMPLOYEE INVITATION ROUTE
// ==========================================

// Invite employee to create their ShiftMate account
router.post(
    "/:id/invite",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    inviteEmployee
);

module.exports = router;
const express = require("express");

const {
    createEmployee,
    getEmployees,
    getEmployeesById,
    updateEmployee,
    deleteEmployee,
} = require("../controllers/employeeController");

const {
    protect,
    authorize,
} = require("../middleware/authMiddleware");

const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

// Create an employee.
// Authentication -> Organisation verification -> Permission check -> Controller
router.post(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    createEmployee
);

// Get all employees belonging to the authenticated organisation.
router.get(
    "/",
    protect,
    requireOrganisationContext,
    getEmployees
);

// Get one employee belonging to the authenticated organisation.
router.get(
    "/:id",
    protect,
    requireOrganisationContext,
    getEmployeesById
);

// Update an employee belonging to the authenticated organisation.
router.put(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    updateEmployee
);

// Delete an employee belonging to the authenticated organisation.
router.delete(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    deleteEmployee
);

module.exports = router;
const express = require("express");

const {
    getMyAvailability,
    updateMyAvailability,
    getEmployeeAvailability,
} = require("../controllers/availabilityController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

router.get("/me", protect, requireOrganisationContext, getMyAvailability);
router.put("/me", protect, requireOrganisationContext, updateMyAvailability);
router.get(
    "/:employeeId",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getEmployeeAvailability
);

module.exports = router;

const express = require("express");

const {
    generatePayrollRun,
    getPayrollRuns,
    getPayrollByPeriod,
    getMyPayslips,
} = require("../controllers/payrollController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

router.post(
    "/generate",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    generatePayrollRun
);
router.get(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getPayrollRuns
);
router.get("/me", protect, requireOrganisationContext, getMyPayslips);
router.get(
    "/:period",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getPayrollByPeriod
);

module.exports = router;

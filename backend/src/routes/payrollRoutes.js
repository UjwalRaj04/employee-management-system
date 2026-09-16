const express = require("express");

const {
    generatePayrollRun,
    getPayrollRuns,
    getPayrollByPeriod,
    getMyPayslips,
} = require("../controllers/payrollController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
    "/generate",
    protect,
    authorize("admin"),
    generatePayrollRun
);
router.get("/", protect, authorize("admin", "manager"), getPayrollRuns);
router.get("/me", protect, getMyPayslips);
router.get(
    "/:period",
    protect,
    authorize("admin", "manager"),
    getPayrollByPeriod
);

module.exports = router;

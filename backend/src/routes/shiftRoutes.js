const express = require("express");

const {
    createShift,
    getShifts,
    getDailySchedule,
    getWeeklySchedule,
    getMyShifts,
    getShiftById,
    updateShift,
    assignShift,
    cancelShift,
} = require("../controllers/shiftController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

router.get("/me", protect, requireOrganisationContext, getMyShifts);
router.get(
    "/daily",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getDailySchedule
);
router.get(
    "/weekly",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getWeeklySchedule
);
router.get(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getShifts
);
router.post(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    createShift
);
router.get(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getShiftById
);
router.put(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    updateShift
);
router.patch(
    "/:id/assign",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    assignShift
);
router.patch(
    "/:id/cancel",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    cancelShift
);

module.exports = router;

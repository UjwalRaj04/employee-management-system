const express = require("express");

const {
    createPosition,
    getPositions,
    getPositionById,
    updatePosition,
    deletePosition,
} = require("../controllers/positionController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

router.post(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    createPosition
);
router.get("/", protect, requireOrganisationContext, getPositions);
router.get("/:id", protect, requireOrganisationContext, getPositionById);
router.put(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    updatePosition
);
router.delete(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    deletePosition
);

module.exports = router;

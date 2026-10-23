const express = require("express");

const {
    createBusinessYear,
    getBusinessYears,
    getCurrentBusinessYear,
    updateBusinessYear,
} = require("../controllers/businessYearController");
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
    createBusinessYear
);
router.get(
    "/",
    protect,
    requireOrganisationContext,
    authorize("admin", "manager"),
    getBusinessYears
);
router.get(
    "/current",
    protect,
    requireOrganisationContext,
    getCurrentBusinessYear
);
router.put(
    "/:id",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    updateBusinessYear
);

module.exports = router;

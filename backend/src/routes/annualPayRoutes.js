const express = require("express");

const { applyPayIncrease } = require("../controllers/annualPayController");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
    requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const router = express.Router();

router.post(
    "/apply",
    protect,
    requireOrganisationContext,
    authorize("admin"),
    applyPayIncrease
);

module.exports = router;

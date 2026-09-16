const express = require("express");

const {
    createBusinessYear,
    getBusinessYears,
    getCurrentBusinessYear,
    updateBusinessYear,
} = require("../controllers/businessYearController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("admin"), createBusinessYear);
router.get("/", protect, authorize("admin", "manager"), getBusinessYears);
router.get("/current", protect, getCurrentBusinessYear);
router.put("/:id", protect, authorize("admin"), updateBusinessYear);

module.exports = router;

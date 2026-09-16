const express = require("express");

const { applyPayIncrease } = require("../controllers/annualPayController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply", protect, authorize("admin"), applyPayIncrease);

module.exports = router;

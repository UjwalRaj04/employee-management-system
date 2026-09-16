const express = require("express");

const {
    createPosition,
    getPositions,
    getPositionById,
    updatePosition,
    deletePosition,
} = require("../controllers/positionController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, authorize("admin"), createPosition);
router.get("/", protect, getPositions);
router.get("/:id", protect, getPositionById);
router.put("/:id", protect, authorize("admin"), updatePosition);
router.delete("/:id", protect, authorize("admin"), deletePosition);

module.exports = router;

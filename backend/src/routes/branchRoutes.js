const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");

const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

const router = express.Router();

router.get("/", protect, getBranches);
router.get("/:id", protect, getBranchById);
router.post("/", protect, authorize("admin"), createBranch);
router.put("/:id", protect, authorize("admin"), updateBranch);
router.delete("/:id", protect, authorize("admin"), deleteBranch);

module.exports = router;
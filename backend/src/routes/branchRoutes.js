const express = require("express");
const { protect, authorize } = require("../middleware/authMiddleware");
const {
  requireOrganisationContext,
} = require("../middleware/tenantContextMiddleware");

const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

const router = express.Router();

router.get("/", protect, requireOrganisationContext, getBranches);
router.get("/:id", protect, requireOrganisationContext, getBranchById);
router.post(
  "/",
  protect,
  requireOrganisationContext,
  authorize("admin"),
  createBranch
);
router.put(
  "/:id",
  protect,
  requireOrganisationContext,
  authorize("admin"),
  updateBranch
);
router.delete(
  "/:id",
  protect,
  requireOrganisationContext,
  authorize("admin"),
  deleteBranch
);

module.exports = router;
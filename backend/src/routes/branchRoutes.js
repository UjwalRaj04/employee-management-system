const express = require("express");

const {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
} = require("../controllers/branchController");

const router = express.Router();

// Create a branch
router.post("/", createBranch);

// Get all branches
router.get("/", getBranches);

// Get one branch
router.get("/:id", getBranchById);

// Update a branch
router.put("/:id", updateBranch);

// Delete a branch
router.delete("/:id", deleteBranch);

module.exports = router;
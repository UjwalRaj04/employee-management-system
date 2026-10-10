const mongoose = require("mongoose");
const Branch=require("../models/Branch");
const Employee = require("../models/Employee");

const handleError = (res, error, label) => {
  console.error(`${label}:`, error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(error.errors).map((e) => e.message),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "Branch name already exists",
    });
  }

  res.status(500).json({
    message: "Server error",
  });
};

const isInvalidId = (id) => !mongoose.isValidObjectId(id);

const createBranch=async(req,res)=>{
    try{
        const {name,address,city,postcode,status}=req.body

        const existingBranch=await Branch.findOne({name});

        if(existingBranch){
            return res.status(400).json({
                message:"Branch already exists",
            });
        }
        const branch = await Branch.create({
      name,
      address,
      city,
      postcode,
      status,
    });

    res.status(201).json({
      message: "Branch created successfully",
      branch,
    });
  } catch (error) {
    handleError(res, error, "Create branch error");
  }
};

// Get all branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find().sort({ name: 1 });

    res.status(200).json({
      branches,
    });
  } catch (error) {
    handleError(res, error, "Get branches error");
  }
};

// Get one branch
const getBranchById = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    res.status(200).json({
      branch,
    });
  } catch (error) {
    handleError(res, error, "Get branch error");
  }
};

// Update branch
const updateBranch = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    const { address, city, postcode, status } = req.body;
    const name = req.body.name?.trim();

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    // Prevent renaming to a name another branch already uses
    if (name !== undefined && name !== branch.name) {
      const duplicate = await Branch.findOne({
        name,
        _id: { $ne: branch._id },
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Branch name already exists",
        });
      }
    }

    // Update only the fields provided
    if (name !== undefined) branch.name = name;
    if (address !== undefined) branch.address = address;
    if (city !== undefined) branch.city = city;
    if (postcode !== undefined) branch.postcode = postcode;
    if (status !== undefined) branch.status = status;

    await branch.save();

    res.status(200).json({
      message: "Branch updated successfully",
      branch,
    });
  } catch (error) {
    handleError(res, error, "Update branch error");
  }
};

// Delete branch
const deleteBranch = async (req, res) => {
  try {
    if (isInvalidId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid branch ID",
      });
    }

    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({
        message: "Branch not found",
      });
    }

    await branch.deleteOne();

    res.status(200).json({
      message: "Branch deleted successfully",
    });
  } catch (error) {
    handleError(res, error, "Delete branch error");
  }
};

module.exports = {
  createBranch,
  getBranches,
  getBranchById,
  updateBranch,
  deleteBranch,
};
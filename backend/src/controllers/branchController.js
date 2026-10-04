const mongoose = require("mongoose");
const Branch=require("../models/Branch");

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
        const branch=await Branch.create({
            name,
            address,
            city,
            
        })
    }
}
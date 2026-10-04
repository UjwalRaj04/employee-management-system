const Branch=require("../models/Branch");

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
            
        })
    }
}
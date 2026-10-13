const mongoose=require("mongoose");
const Organisation=require("../models/Organisation");

const requireOrganisationContext=async(req,res,next)=>{
    if(!req.user||req.user.id){
        return res.status(401).json({
            message:"Authentication required",
        });
    }

    const organisationId=req.user.organisationId;

    if(!organisationId){
        return res.status(403).json({
            message:"Your account is not associated with an organisation",
        });
    }
    if(!mongoose.Types.ObjectId.isValid(organisationId)){
        return res.status(403).json({
            message:"Invalid organisation membership",
        });
    }

    try{
        const organisation=await Organisation.findById(
            organisationId
        ).select("_id name slug status");

        if(!organisation){
            return res.status(403).json({
                message:"Organisation not found",
            });
        }

        req.organisationId=organisation._id;

        req.organisation={
            id:organisation._id.toString(),
            name:organisation.name,
            slug:organisation.slug,
            status:organisation.status,
        };
        return next();
    }catch(error){
        console.error("Tenant context middleware error:",error);

        return res.status(500).json({
            message:"Unable to verify organisation context",
        });
    }
};

module.exports={requireOrganisationContext,};
const mongoose=require("mongoose")
const branchSchema=new mongoose.Schema(
    {
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organisation",
            required: true,
            index: true,
        },
        name:{
            type:String,
            required:true,
            trim:true,
        },
        address:{
            type:String,
            required:true,
            trim:true,
        },
        city:{
            type:String,
            required:true,
            trim:true,
        },
        postcode:{
            type:String,
            required:true,
            trim:true,
        },
        status:{
            type:String,
            enum:["active","inactive"],
            default:"active",
        },
    },
    {
        timestamps:true,
    }
);

branchSchema.index(
    { organisationId: 1, name: 1 },
    { unique: true }
);

const Branch=mongoose.model("Branch",branchSchema);
module.exports=Branch;
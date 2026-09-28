const mongoose=require("mongoose")
const branchSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:true,
            unique:true,
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

const Branch=mongoose.model("Branch",branchSchema);
module.exports=Branch;
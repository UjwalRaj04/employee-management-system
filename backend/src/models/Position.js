const mongoose=require("mongoose");


const positionSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            unique:true,
            required:true,
            trim:true,
        },
        pay:{
            type:Number,
            required:true,
            min:0,
        },

        payPeriod:{
            type:String,
            enum:["hourly","monthly"],
            required:true,
        }
    },
    {
        timestamps:true,
        
    }
);

const Position=mongoose.model("Position",positionSchema);

module.exports=Position;
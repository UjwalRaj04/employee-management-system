const mongoose=require("mongoose");


const positionSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            enum:["hourly","monthly"],
            required:true,
        },
        payRate:{
            type:Number,
            required:true,
            min:0,
        },
    },
    {
        timestamps:true
    }
);
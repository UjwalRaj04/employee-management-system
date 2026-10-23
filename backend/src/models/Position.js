const mongoose=require("mongoose");


const positionSchema=new mongoose.Schema(
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
        collection:"Positions"
    }
);

positionSchema.index(
    { organisationId: 1, name: 1 },
    { unique: true }
);

const Position=mongoose.model("Position",positionSchema);

module.exports=Position;
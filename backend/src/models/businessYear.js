const mongoose=require("mongoose");

const businessYearSchema=new mongoose.Schema({
    year:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },

    payIncreaseAmount:{
        type:Number,
        required:true,
        min:0,
    },

    payIncreaseApplied:{
        type:Boolean,
        default:false,
    },

},
{
    timestamps:true,
}
);

const BusinessYear=mongoose.model("BusinessYear",businessYearSchema);

module.exports=BusinessYear;
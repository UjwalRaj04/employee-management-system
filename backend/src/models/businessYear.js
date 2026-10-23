const mongoose=require("mongoose");

const businessYearSchema=new mongoose.Schema({
    organisationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organisation",
        required: true,
        index: true,
    },
    year:{
        type:String,
        required:true,
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

businessYearSchema.index(
    { organisationId: 1, year: 1 },
    { unique: true }
);

const BusinessYear=mongoose.model("BusinessYear",businessYearSchema);

module.exports=BusinessYear;
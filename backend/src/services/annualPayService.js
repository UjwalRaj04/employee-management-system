const Employee = require("../models/Employee");
const BusinessYear = require("../models/businessYear");
const getBusinessYear = require("../utils/businessYear");

const applyAnnualPayIncrease = async () => {
    try {
        const currentBusinessYear = getBusinessYear();

        console.log("Current Business Year:", currentBusinessYear);

        const businessYear = await BusinessYear.findOne({
            year: currentBusinessYear
        });

        if (!businessYear) {
            throw new Error(
                `Business Year ${currentBusinessYear} was not found`
            );

        }

        if (businessYear.payIncreaseApplied) {
            throw new Error(
                `Pay Increase for ${currentBusinessYear} has already been applied`
            );

        }

        const employees=await Employee.find({
            position:{
                $in:["Team Member","Team Leader"]
            },
            payPeriod:"hourly",
            status:"active"
        });

        console.log("Eligible Employees:",employees.length);

        for(const employee of employees){
            employee.pay=employee.pay+businessYear.payIncreaseAmount;

            await employee.save();
        }

        businessYear.payIncreaseApplied=true;
        await businessYear.save(); 

        return{
            message:"Annual pay increase applied sucessfully"
        }
    }
    catch (error) {

    }
}
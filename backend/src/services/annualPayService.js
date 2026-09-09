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

        console.log("business year found:",businessYear.year);

        if (businessYear.payIncreaseApplied) {
            throw new Error(
                `Pay Increase for ${currentBusinessYear} has already been applied`
            );

        }
        console.log("Pay Increase:",businessYear.payIncreaseAmount)
        
        const employees=await Employee.find({
            position:{
                $in:["Team Member","Team Leader"]
            },
            payPeriod:"hourly",
            status:"active"
        });

        console.log("Eligible Employees:",employees.length);

        if(employees.length===0){
            return{
                message:"No eligible employees found",
                businessYear:currentBusinessYear,
                increase:businessYear.payIncreaseAmount,
                employeesUpdated:0
            };
        }

        for(const employee of employees){
            employee.pay=employee.pay+businessYear.payIncreaseAmount;

            await employee.save();
        }

        businessYear.payIncreaseApplied=true;
        await businessYear.save(); 

        return{
            message:"Annual pay increase applied sucessfully",
            businessYear:currentBusinessYear,
            increase:businessYear.payIncreaseAmount,
            employeesUpdated:employees.length

        };
    }
    catch (error) {
         console.error(
            "Annual pay increase error:",
            error
        );

        throw error;
    }
};

module.exports=applyAnnualPayIncrease;
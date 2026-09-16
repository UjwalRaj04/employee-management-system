const Employee = require("../models/Employee");
const BusinessYear = require("../models/businessYear");
const Position=require("../models/Position");
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

        const eligiblePositionNames = ["Team Member", "Team Leader"];

        const positions=await Position.find({
            name:{
                $in: eligiblePositionNames
            },
            payPeriod:"hourly"
        });
        console.log("Eligible Positions:",positions.length);

        for(const position of positions){
            console.log(position.name,
                "Current Pay:",
                position.pay,
                "Pay Period:",
                position.payPeriod
            );
        }
        
        const employees=await Employee.find({
            position:{
                $in: eligiblePositionNames
            },
            payPeriod:"hourly",
            status:"active"
        });

        console.log("Eligible Employees:",employees.length);

        for(const employee of employees){
            employee.pay=employee.pay+businessYear.payIncreaseAmount;

            await employee.save();
        }

        for(const position of positions){
            position.pay=position.pay+businessYear.payIncreaseAmount;
            await position.save();
        }

        businessYear.payIncreaseApplied=true;
        await businessYear.save(); 

        return{
            message: employees.length === 0
                ? "No eligible employees found. Position rates were still updated."
                : "Annual pay increase applied sucessfully",
            businessYear:currentBusinessYear,
            increase:businessYear.payIncreaseAmount,
            employeesUpdated:employees.length,
            positionsUpdated:positions.length,
            updatedPositions: positions.map((position) => ({
                name: position.name,
                pay: position.pay,
                payPeriod: position.payPeriod,
            })),
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
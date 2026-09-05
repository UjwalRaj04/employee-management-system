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

        const 
    }
    catch (error) {

    }
}
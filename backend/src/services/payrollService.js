const Employee = require("../models/Employee");
const PayrollRun = require("../models/PayrollRun");
const Payslip = require("../models/Payslip");
const getBusinessYear = require("../utils/businessYear");

const roundMoney = (value) => Math.round(value * 100) / 100;

const parsePeriod = (period) => {
    const match = /^(\d{4})-(\d{2})$/.exec(period);

    if (!match) {
        throw new Error("Payroll period must be in YYYY-MM format");
    }

    const year = Number(match[1]);
    const month = Number(match[2]);

    if (month < 1 || month > 12) {
        throw new Error("Payroll period month must be between 01 and 12");
    }

    return new Date(year, month - 1, 1);
};

const calculatePayslipAmounts = (employee, hoursWorked) => {
    const payRateUsed = employee.pay;

    if (employee.payPeriod === "hourly") {
        const salary = roundMoney(hoursWorked * payRateUsed);

        return {
            payType: "hourly",
            payRateUsed,
            hoursWorked,
            salary,
        };
    }

    const salary = roundMoney(payRateUsed / 12);

    return {
        payType: "monthly",
        payRateUsed,
        hoursWorked: 0,
        salary,
    };
};

const generatePayroll = async ({ period, hoursByEmployee = {}, generatedBy }) => {
    if (!period) {
        throw new Error("Payroll period is required");
    }

    const periodDate = parsePeriod(period);
    const businessYear = getBusinessYear(periodDate);

    const existingRun = await PayrollRun.findOne({ period });

    if (existingRun) {
        throw new Error(
            `Payroll for ${period} has already been generated and cannot be recalculated`
        );
    }

    const employees = await Employee.find({ status: "active" });

    if (employees.length === 0) {
        throw new Error("No active employees found for payroll");
    }

    const payslipsToCreate = employees.map((employee) => {
        const hoursWorked = Number(
            hoursByEmployee[employee._id.toString()] ?? 0
        );

        const amounts = calculatePayslipAmounts(employee, hoursWorked);
        const deductions = 0;
        const additions = 0;
        const finalAmount = roundMoney(
            amounts.salary - deductions + additions
        );

        return {
            employee: employee._id,
            employeeName: employee.name,
            employeeEmail: employee.email,
            position: employee.position,
            period,
            businessYear,
            payType: amounts.payType,
            payRateUsed: amounts.payRateUsed,
            hoursWorked: amounts.hoursWorked,
            salary: amounts.salary,
            deductions,
            additions,
            finalAmount,
        };
    });

    const totalGross = roundMoney(
        payslipsToCreate.reduce((sum, payslip) => sum + payslip.finalAmount, 0)
    );

    const payrollRun = await PayrollRun.create({
        period,
        businessYear,
        status: "generated",
        payslipCount: payslipsToCreate.length,
        totalGross,
        generatedBy,
    });

    const payslips = await Payslip.insertMany(
        payslipsToCreate.map((payslip) => ({
            ...payslip,
            payrollRun: payrollRun._id,
        }))
    );

    return {
        message: "Payroll generated successfully",
        payrollRun,
        payslips,
    };
};

const getPayrollRunByPeriod = async (period) => {
    const payrollRun = await PayrollRun.findOne({ period });

    if (!payrollRun) {
        return null;
    }

    const payslips = await Payslip.find({ period }).sort({ employeeName: 1 });

    return { payrollRun, payslips };
};

module.exports = {
    generatePayroll,
    getPayrollRunByPeriod,
};

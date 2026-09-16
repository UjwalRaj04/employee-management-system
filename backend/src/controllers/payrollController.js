const {
    generatePayroll,
    getPayrollRunByPeriod,
} = require("../services/payrollService");
const PayrollRun = require("../models/PayrollRun");
const Payslip = require("../models/Payslip");

const generatePayrollRun = async (req, res) => {
    try {
        const { period, hoursByEmployee } = req.body;

        const result = await generatePayroll({
            period,
            hoursByEmployee,
            generatedBy: req.user.email,
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Generate payroll error:", error);

        const knownErrors = [
            "required",
            "YYYY-MM",
            "already been generated",
            "No active employees",
            "month must be",
        ];

        const isClientError = knownErrors.some((text) =>
            error.message.includes(text)
        );

        res.status(isClientError ? 400 : 500).json({
            message: error.message || "Server Error",
        });
    }
};

const getPayrollRuns = async (req, res) => {
    try {
        const payrollRuns = await PayrollRun.find({}).sort({ period: -1 });

        if (payrollRuns.length === 0) {
            return res.status(200).json({
                message: "No payroll history found",
                count: 0,
                payrollRuns: [],
            });
        }

        res.status(200).json({
            message: "Payroll history retrieved successfully",
            count: payrollRuns.length,
            payrollRuns,
        });
    } catch (error) {
        console.error("Get payroll runs error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const getPayrollByPeriod = async (req, res) => {
    try {
        const result = await getPayrollRunByPeriod(req.params.period);

        if (!result) {
            return res.status(404).json({
                message: `Payroll for ${req.params.period} was not found`,
            });
        }

        res.status(200).json({
            message: "Payroll retrieved successfully",
            payrollRun: result.payrollRun,
            payslips: result.payslips,
        });
    } catch (error) {
        console.error("Get payroll by period error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const getMyPayslips = async (req, res) => {
    try {
        const payslips = await Payslip.find({
            employeeEmail: req.user.email,
        }).sort({ period: -1 });

        res.status(200).json({
            message: payslips.length
                ? "Payslips retrieved successfully"
                : "No payslips found",
            count: payslips.length,
            payslips,
        });
    } catch (error) {
        console.error("Get my payslips error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = {
    generatePayrollRun,
    getPayrollRuns,
    getPayrollByPeriod,
    getMyPayslips,
};

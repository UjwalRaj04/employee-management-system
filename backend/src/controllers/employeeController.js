const Employee = require("../models/Employee")


const createEmployee = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            position,
            location,
            joiningDate,
            hourlyRate,
        } = req.body
        if (!name || !email || !phone || !position || !location || !joiningDate || !hourlyRate === undefined) {
            return res.status(400).json({
                message: "All employee fields are required",
            });
        }

        const exisitngEmployee = await Employee.findOne({ email });

        if (exisitngEmployee) {
            return res.status(400).json({
                message: "Employee with this email already exists"
            });
        }

        const employee = await Employee.create({
            name, email, phone, position, location, joiningDate, hourlyRate,
        });
        res.status(201).json({
            message: "Employee created Successfully", employee
        });
    }
    catch (error) {
        console.error("Create employee error:", error);
        res.status(500).json({
            message: "Server Error"
        })
    }
}
const getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({});
        res.status(200).json({
            message: "Employees retrieved successfully",
            count: employees.length,
            employees
        });

    }
    catch (error) {
        console.error("Get employees error:", error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

const getEmployeesById = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found",
            });
        }
        res.status(200).json({
            message: "Employee Retrieved Successfully", employee
        });
    }
    catch (error) {

        console.error("Get Employee by ID error:", error)
        return res.status(500).json({
            message: "Server error"
        });
    }
}
const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id

        const updates = req.body

        const employee = await Employee.findByIdAndUpdate(employeeId,
            { $set: updates },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        res.status(200).json({
            message: "Employee Updated Successfully", employee
        });
    }
    catch (error) {
        console.error("Update Employee error:", error)

        res.status(500).json({
            message: "Server Error"
        });
    }
};
const deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;

        const employee = await Employee.findByIdAndDelete(employeeId);

        if (!employee) {
            return res.status(404).json({
                message: "Employee Not Found",
            });
        }

        res.status(200).json({
            message: "Employee Deleted Successfully", employee
        });
    }
    catch (error) {
        console.error("Delete Employee error:", error)

        res.status(500).json({
            message: "Server Error"
        });
    }
};
module.exports = { createEmployee, getEmployees, getEmployeesById, updateEmployee, deleteEmployee };
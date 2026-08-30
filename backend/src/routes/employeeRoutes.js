const express = require("express");

const { createEmployee, getEmployees,getEmployeesById,updateEmployee,deleteEmployee} = require("../controllers/employeeController");
const { protect,authorize } = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", protect,authorize("admin","manager"),createEmployee);
router.get("/",protect,getEmployees);
router.get("/:id",protect,getEmployeesById)
router.put("/:id",protect,updateEmployee)
router.delete("/:id",protect,deleteEmployee)
module.exports = router;
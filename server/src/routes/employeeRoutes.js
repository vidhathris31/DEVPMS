import { Router } from "express";
import { body } from "express-validator";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeeController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.post(
  "/",
  [
    body("name").trim().notEmpty(),
    body("role").trim().notEmpty(),
    body("email").isEmail(),
  ],
  validate,
  createEmployee
);
router.put("/:id", updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;

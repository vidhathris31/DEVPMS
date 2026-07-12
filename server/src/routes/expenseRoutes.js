import { Router } from "express";
import { body } from "express-validator";
import { getExpenses, createExpense, updateExpense, deleteExpense } from "../controllers/expenseController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getExpenses);
router.post(
  "/",
  [body("project").notEmpty(), body("category").trim().notEmpty(), body("amount").isFloat({ min: 0 })],
  validate,
  createExpense
);
router.put(
  "/:id",
  [body("amount").optional().isFloat({ min: 0 })],
  validate,
  updateExpense
);
router.delete("/:id", deleteExpense);

export default router;

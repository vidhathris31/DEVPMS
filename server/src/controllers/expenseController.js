import asyncHandler from "express-async-handler";
import Expense from "../models/Expense.js";
import { pick } from "../utils/pick.js";
import { createNotification } from "./notificationController.js";

const UPDATABLE_FIELDS = ["project", "projectName", "category", "description", "amount", "date"];

export const getExpenses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  const expenses = await Expense.find(filter).sort({ date: -1 });
  res.json(expenses);
});

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.create({ ...req.body, createdBy: req.user._id });

  await createNotification({
    user: req.user._id,
    type: "expense_added",
    message: `Expense logged: ${expense.description} (₹${expense.amount.toLocaleString("en-IN")})`,
    project: expense.project,
    projectName: expense.projectName,
    expense: expense._id,
  });

  res.status(201).json(expense);
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndUpdate(req.params.id, pick(req.body, UPDATABLE_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.json(expense);
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findByIdAndDelete(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error("Expense not found");
  }
  res.status(204).end();
});

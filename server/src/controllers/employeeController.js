import asyncHandler from "express-async-handler";
import Employee from "../models/Employee.js";
import { pick } from "../utils/pick.js";

const UPDATABLE_FIELDS = ["name", "role", "dept", "status", "avatar", "email", "joined", "skills", "workload", "user"];

export const getEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find().sort({ name: 1 });
  res.json(employees);
});

export const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json(employee);
});

export const createEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.create(req.body);
  res.status(201).json(employee);
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, pick(req.body, UPDATABLE_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.json(employee);
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);
  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }
  res.status(204).end();
});

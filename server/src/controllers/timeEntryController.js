import asyncHandler from "express-async-handler";
import TimeEntry from "../models/TimeEntry.js";
import { pick } from "../utils/pick.js";

const UPDATABLE_FIELDS = ["project", "projectName", "task", "engineer", "date", "hours", "billable"];

export const getTimeEntries = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  const entries = await TimeEntry.find(filter).sort({ date: -1 });
  res.json(entries);
});

export const createTimeEntry = asyncHandler(async (req, res) => {
  const entry = await TimeEntry.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(entry);
});

export const updateTimeEntry = asyncHandler(async (req, res) => {
  const entry = await TimeEntry.findByIdAndUpdate(req.params.id, pick(req.body, UPDATABLE_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!entry) {
    res.status(404);
    throw new Error("Time entry not found");
  }
  res.json(entry);
});

export const deleteTimeEntry = asyncHandler(async (req, res) => {
  const entry = await TimeEntry.findByIdAndDelete(req.params.id);
  if (!entry) {
    res.status(404);
    throw new Error("Time entry not found");
  }
  res.status(204).end();
});

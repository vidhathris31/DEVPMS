import asyncHandler from "express-async-handler";
import Project from "../models/Project.js";
import { pick } from "../utils/pick.js";
import { createNotification } from "./notificationController.js";

const UPDATABLE_FIELDS = [
  "name", "repo", "type", "status", "priority", "budget", "spent", "start", "deadline",
  "progress", "stack", "team", "tasks", "prs", "deploys", "milestones", "velocity",
  "budgetHistory", "notes",
];

// @route GET /api/projects
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  res.json(projects);
});

// @route GET /api/projects/:id
export const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json(project);
});

// @route POST /api/projects
export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({ ...req.body, owner: req.user._id });
  res.status(201).json(project);
});

// @route PUT /api/projects/:id
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, pick(req.body, UPDATABLE_FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.json(project);
});

// @route DELETE /api/projects/:id
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  res.status(204).end();
});

// @route POST /api/projects/:id/tasks
export const addTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  project.tasks.push(req.body);
  await project.save();

  const newTask = project.tasks[project.tasks.length - 1];
  await createNotification({
    user: req.user._id,
    type: "task_assigned",
    message: newTask.assignee ? `Task "${newTask.title}" assigned to ${newTask.assignee}` : `Task "${newTask.title}" added`,
    project: project._id,
    projectName: project.name,
    taskId: String(newTask._id),
  });

  res.status(201).json(project);
});

const TASK_FIELDS = ["title", "description", "status", "priority", "assignee", "due", "points"];

// @route PATCH /api/projects/:id/tasks/:taskId
export const updateTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  const task = project.tasks.id(req.params.taskId);
  if (!task) {
    res.status(404);
    throw new Error("Task not found");
  }
  Object.assign(task, pick(req.body, TASK_FIELDS));
  await project.save();
  res.json(project);
});

// @route DELETE /api/projects/:id/tasks/:taskId
export const deleteTask = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error("Project not found");
  }
  project.tasks.id(req.params.taskId)?.deleteOne();
  await project.save();
  res.json(project);
});

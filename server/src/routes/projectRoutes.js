import { Router } from "express";
import { body } from "express-validator";
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTask,
  updateTask,
  deleteTask,
} from "../controllers/projectController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getProjects);
router.get("/:id", getProjectById);

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Project name is required"),
    body("budget").optional().isNumeric().withMessage("Budget must be a number"),
  ],
  validate,
  createProject
);

router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

router.post("/:id/tasks", body("title").trim().notEmpty(), validate, addTask);
router.patch("/:id/tasks/:taskId", updateTask);
router.delete("/:id/tasks/:taskId", deleteTask);

export default router;

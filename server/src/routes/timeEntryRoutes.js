import { Router } from "express";
import { body } from "express-validator";
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from "../controllers/timeEntryController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getTimeEntries);
router.post(
  "/",
  [body("project").notEmpty(), body("task").trim().notEmpty(), body("hours").isFloat({ min: 0 })],
  validate,
  createTimeEntry
);
router.put("/:id", updateTimeEntry);
router.delete("/:id", deleteTimeEntry);

export default router;

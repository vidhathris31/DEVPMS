import { Router } from "express";
import { body } from "express-validator";
import { getComments, createComment, deleteComment } from "../controllers/commentController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getComments);
router.post("/", [body("project").notEmpty(), body("text").trim().notEmpty()], validate, createComment);
router.delete("/:id", deleteComment);

export default router;

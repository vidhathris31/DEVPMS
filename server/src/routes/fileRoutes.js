import { Router } from "express";
import { body } from "express-validator";
import { getFiles, createFile, uploadFile, deleteFile } from "../controllers/fileController.js";
import { validate } from "../middleware/validate.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(protect);

router.get("/", getFiles);
router.post("/", [body("name").trim().notEmpty()], validate, createFile);
router.post("/upload", upload.single("file"), uploadFile);
router.delete("/:id", deleteFile);

export default router;


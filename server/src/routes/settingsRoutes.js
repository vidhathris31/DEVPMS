import { Router } from "express";
import { getSettings, updateSettings, setMood } from "../controllers/settingsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.get("/", getSettings);
router.put("/", updateSettings);
router.post("/mood", setMood);

export default router;

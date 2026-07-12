import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chat, getHistory } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// AI calls are comparatively expensive — keep a tighter limit than the global one.
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many AI requests — please slow down." } },
});

router.use(protect);
router.post("/chat", aiLimiter, chat);
router.get("/history/:feature", getHistory);

export default router;

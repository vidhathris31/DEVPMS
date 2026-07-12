import asyncHandler from "express-async-handler";
import { generateChatCompletion } from "../services/groqService.js";
import AiHistory from "../models/AiHistory.js";

const FEATURES = [
  "ai-analyst",
  "code-review",
  "burndown",
  "sprint-planner",
  "tech-debt",
  "reports",
];

// @route POST /api/ai/chat
// Body: { feature, system, messages: [{role, content}], project?, maxTokens? }
export const chat = asyncHandler(async (req, res) => {
  const { feature, system, messages, project, maxTokens } = req.body;

  if (!feature || !FEATURES.includes(feature)) {
    res.status(400);
    throw new Error(`feature must be one of: ${FEATURES.join(", ")}`);
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400);
    throw new Error("messages array is required");
  }

  const text = await generateChatCompletion({ system, messages, maxTokens });

  // Persist a lightweight history record (best-effort — don't fail the request if this errors)
  try {
    await AiHistory.findOneAndUpdate(
      { user: req.user._id, feature, project: project || null },
      {
        $push: {
          messages: {
            $each: [
              { role: "user", text: messages[messages.length - 1]?.content || "" },
              { role: "assistant", text },
            ],
          },
        },
      },
      { upsert: true, new: true }
    );
  } catch (persistErr) {
    console.warn("[ai] history persist failed:", persistErr.message);
  }

  res.json({ text });
});

// @route GET /api/ai/history/:feature
export const getHistory = asyncHandler(async (req, res) => {
  const { feature } = req.params;
  const filter = { user: req.user._id, feature };
  if (req.query.project) filter.project = req.query.project;

  const history = await AiHistory.findOne(filter);
  res.json(history || { messages: [], lastResult: null });
});

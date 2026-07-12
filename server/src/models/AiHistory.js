import mongoose from "mongoose";

const aiMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
  },
  { _id: false, timestamps: true }
);

const aiHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    feature: {
      type: String,
      enum: [
        "ai-analyst",
        "code-review",
        "burndown",
        "sprint-planner",
        "tech-debt",
        "reports",
      ],
      required: true,
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    messages: { type: [aiMessageSchema], default: [] },
    lastResult: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("AiHistory", aiHistorySchema);

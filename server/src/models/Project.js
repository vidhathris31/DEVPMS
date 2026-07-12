import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    name: String,
    role: String,
    avatar: String,
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  status: { type: String, enum: ["todo", "active", "done"], default: "todo" },
  priority: { type: String, enum: ["critical", "high", "low"], default: "high" },
  assignee: String,
  due: Date,
  points: { type: Number, default: 1 },
});

const prSchema = new mongoose.Schema(
  {
    title: String,
    author: String,
    status: { type: String, enum: ["open", "review", "merged", "closed"], default: "open" },
    comments: { type: Number, default: 0 },
    changed: String,
    time: String,
  },
  { _id: false }
);

const deploySchema = new mongoose.Schema(
  {
    env: String,
    version: String,
    status: { type: String, enum: ["live", "deploying", "failed"], default: "live" },
    time: String,
  },
  { _id: false }
);

const milestoneSchema = new mongoose.Schema(
  {
    pct: Number,
    label: String,
    done: { type: Boolean, default: false },
  },
  { _id: false }
);

const budgetHistorySchema = new mongoose.Schema(
  {
    m: String,
    v: Number,
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    repo: { type: String, trim: true },
    type: { type: String, default: "Full-Stack" },
    status: { type: String, enum: ["active", "shipped", "paused"], default: "active" },
    priority: { type: String, enum: ["critical", "high", "low"], default: "high" },
    budget: { type: Number, default: 0, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    start: Date,
    deadline: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    stack: { type: [String], default: [] },
    team: { type: [teamMemberSchema], default: [] },
    tasks: { type: [taskSchema], default: [] },
    prs: { type: [prSchema], default: [] },
    deploys: { type: [deploySchema], default: [] },
    milestones: { type: [milestoneSchema], default: [] },
    velocity: { type: [Number], default: [] },
    budgetHistory: { type: [budgetHistorySchema], default: [] },
    notes: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

projectSchema.index({ name: "text", notes: "text" });

export default mongoose.model("Project", projectSchema);

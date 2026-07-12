import mongoose from "mongoose";

const timeEntrySchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    projectName: String,
    task: { type: String, required: true },
    engineer: String,
    date: { type: Date, default: Date.now },
    hours: { type: Number, required: true, min: 0 },
    billable: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("TimeEntry", timeEntrySchema);

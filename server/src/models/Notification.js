import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["task_assigned", "expense_added", "file_uploaded"],
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: String,
    // Tasks are subdocuments of Project, not their own collection, so we
    // reference the task's subdocument _id as a plain string rather than a ref.
    taskId: String,
    expense: { type: mongoose.Schema.Types.ObjectId, ref: "Expense" },
    file: { type: mongoose.Schema.Types.ObjectId, ref: "FileRecord" },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);

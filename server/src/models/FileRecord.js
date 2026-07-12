import mongoose from "mongoose";

const fileRecordSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: String,
    name: { type: String, required: true },
    type: { type: String, default: "other" },
    size: { type: Number, default: 0 },
    url: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploadedByName: String,
  },
  { timestamps: true }
);

export default mongoose.model("FileRecord", fileRecordSchema);

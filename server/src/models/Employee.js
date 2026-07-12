import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    dept: { type: String, required: true, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    avatar: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    joined: { type: Date, required: true },
    skills: { type: [String], default: [] },
    workload: { type: Number, min: 0, max: 100, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);

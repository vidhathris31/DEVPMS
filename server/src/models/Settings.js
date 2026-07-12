import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["dark", "light"], default: "dark" },
    sidebarCollapsed: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
    moods: {
      type: Map,
      of: new mongoose.Schema(
        { mood: String, note: String, date: { type: Date, default: Date.now } },
        { _id: false }
      ),
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", settingsSchema);

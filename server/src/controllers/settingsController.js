import asyncHandler from "express-async-handler";
import Settings from "../models/Settings.js";

async function getOrCreate(userId) {
  let settings = await Settings.findOne({ user: userId });
  if (!settings) settings = await Settings.create({ user: userId });
  return settings;
}

export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate(req.user._id);
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await getOrCreate(req.user._id);
  const { theme, sidebarCollapsed, notificationsEnabled } = req.body;

  if (theme !== undefined) settings.theme = theme;
  if (sidebarCollapsed !== undefined) settings.sidebarCollapsed = sidebarCollapsed;
  if (notificationsEnabled !== undefined) settings.notificationsEnabled = notificationsEnabled;

  await settings.save();
  res.json(settings);
});

export const setMood = asyncHandler(async (req, res) => {
  const settings = await getOrCreate(req.user._id);
  const { employeeId, mood, note } = req.body;

  if (!employeeId || !mood) {
    res.status(400);
    throw new Error("employeeId and mood are required");
  }

  settings.moods.set(employeeId, { mood, note: note || "", date: new Date() });
  await settings.save();
  res.json(settings);
});

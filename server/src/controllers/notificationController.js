import asyncHandler from "express-async-handler";
import Notification from "../models/Notification.js";

// @route GET /api/notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
});

// @route PATCH /api/notifications/:id/read
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) {
    res.status(404);
    throw new Error("Notification not found");
  }
  res.json(notification);
});

// @route PATCH /api/notifications/read-all
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json(notifications);
});

/**
 * Best-effort notification creation, used internally by other controllers
 * (task assignment, expense logging, file uploads). Never throws — a
 * notification failing to save should not fail the action that triggered it.
 */
export async function createNotification(payload) {
  try {
    await Notification.create(payload);
  } catch (err) {
    console.warn("[notifications] failed to create:", err.message);
  }
}

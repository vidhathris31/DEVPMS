import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import Settings from "../models/Settings.js";
import { generateToken } from "../utils/generateToken.js";

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(409);
    throw new Error("An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role: role || "member" });
  await Settings.create({ user: user._id });

  res.status(201).json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    user: user.toSafeObject(),
    token: generateToken(user._id),
  });
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

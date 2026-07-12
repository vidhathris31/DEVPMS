import asyncHandler from "express-async-handler";
import Comment from "../models/Comment.js";

export const getComments = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  const comments = await Comment.find(filter).sort({ createdAt: -1 });
  res.json(comments);
});

export const createComment = asyncHandler(async (req, res) => {
  const comment = await Comment.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(comment);
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.id);
  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }
  res.status(204).end();
});

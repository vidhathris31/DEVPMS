import asyncHandler from "express-async-handler";
import path from "node:path";
import fs from "node:fs";
import FileRecord from "../models/FileRecord.js";
import { createNotification } from "./notificationController.js";
import { UPLOAD_DIR } from "../middleware/upload.js";

const EXT_TYPE_MAP = {
  ".pdf": "pdf", ".md": "md", ".markdown": "md", ".fig": "fig", ".pptx": "pptx", ".ppt": "pptx",
  ".sql": "sql", ".docx": "docx", ".doc": "docx", ".png": "png", ".jpg": "png", ".jpeg": "png",
  ".gif": "png", ".zip": "zip", ".rar": "zip",
};

export const getFiles = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.project) filter.project = req.query.project;
  const files = await FileRecord.find(filter).sort({ createdAt: -1 });
  res.json(files);
});

export const createFile = asyncHandler(async (req, res) => {
  const file = await FileRecord.create({
    ...req.body,
    uploadedBy: req.user._id,
    uploadedByName: req.user.name,
  });
  res.status(201).json(file);
});

// @route POST /api/files/upload  (multipart/form-data: file, project, projectName)
export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const type = EXT_TYPE_MAP[ext] || "other";

  const file = await FileRecord.create({
    project: req.body.project || undefined,
    projectName: req.body.projectName || "",
    name: req.file.originalname,
    type,
    size: req.file.size,
    url: `/uploads/${req.file.filename}`,
    uploadedBy: req.user._id,
    uploadedByName: req.user.name,
  });

  await createNotification({
    user: req.user._id,
    type: "file_uploaded",
    message: `File uploaded: ${file.name}`,
    project: file.project,
    projectName: file.projectName,
    file: file._id,
  });

  res.status(201).json(file);
});

export const deleteFile = asyncHandler(async (req, res) => {
  const file = await FileRecord.findByIdAndDelete(req.params.id);
  if (!file) {
    res.status(404);
    throw new Error("File not found");
  }

  // Best-effort cleanup of the underlying uploaded file, if it's one we stored locally.
  if (file.url?.startsWith("/uploads/")) {
    const filename = path.basename(file.url);
    fs.unlink(path.join(UPLOAD_DIR, filename), () => {});
  }

  res.status(204).end();
});

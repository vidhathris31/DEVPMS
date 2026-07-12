import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

// Resolved from this file's own location (server/src/middleware/upload.js ->
// server/uploads), not process.cwd(). Using cwd here would make the upload
// location depend on the directory the server happens to be launched from
// (e.g. the repo root vs. server/), which could silently diverge from where
// app.js serves files from and produce "file not found" for real uploads.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${unique}${ext}`);
  },
});

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

export { UPLOAD_DIR };

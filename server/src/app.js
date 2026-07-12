import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import timeEntryRoutes from "./routes/timeEntryRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { UPLOAD_DIR } from "./middleware/upload.js";

/**
 * Builds the CORS origin check.
 *
 * CLIENT_URL may be a single URL or a comma-separated list (e.g. when you
 * need both http://localhost:5173 and a LAN IP like http://192.168.x.x:5173
 * during dev). In development, any http://localhost:*, http://127.0.0.1:*,
 * or private-LAN (192.168.x.x / 10.x.x.x) origin on port 5173 is allowed
 * automatically so opening the app from a phone/another device on the same
 * network just works. In production, only origins in CLIENT_URL are allowed.
 */
function buildCorsOrigin() {
  const allowList = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const isDev = process.env.NODE_ENV !== "production";
  const lanPattern = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}):\d+$/;

  return function origin(requestOrigin, callback) {
    if (!requestOrigin) return callback(null, true); // same-origin / curl / server-to-server
    if (allowList.includes(requestOrigin)) return callback(null, true);
    if (isDev && lanPattern.test(requestOrigin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${requestOrigin}`));
  };
}

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: buildCorsOrigin(),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(mongoSanitize());

  // Serve uploaded files. CORP is relaxed here (but nowhere else) so the
  // frontend dev server on a different port can actually load them.
  app.use(
    "/uploads",
    (req, res, next) => {
      res.header("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(UPLOAD_DIR)
  );

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  }

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 500,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", globalLimiter);

  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      env: process.env.NODE_ENV || "development",
      hasgroqKey: Boolean(process.env.groq_API_KEY),
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/projects", projectRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/time-entries", timeEntryRoutes);
  app.use("/api/comments", commentRoutes);
  app.use("/api/files", fileRoutes);
  app.use("/api/expenses", expenseRoutes);
  app.use("/api/settings", settingsRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

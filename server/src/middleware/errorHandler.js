export function notFound(req, res, next) {
  res.status(404);
  next(new Error(`Route not found — ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Internal server error";

  // Malformed JSON request body (thrown by express.json() before any route runs)
  if (err.type === "entity.parse.failed" || (err instanceof SyntaxError && "body" in err)) {
    statusCode = 400;
    message = "Malformed JSON in request body";
  }

  // Multer upload errors (e.g. file too large)
  if (err.name === "MulterError") {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.message;
  }

  // Custom application errors that already carry an intended status code
  // (e.g. groqServiceError from the groq API service)
  if (typeof err.statusCode === "number") {
    statusCode = err.statusCode;
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field ? `${field} already in use` : "Duplicate value";
  }

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
    },
  });
}

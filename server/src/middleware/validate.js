import { validationResult } from "express-validator";

/**
 * Runs after an array of express-validator checks.
 * If validation failed, responds 400 with a list of field errors.
 */
export function validate(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  res.status(400).json({
    error: {
      message: "Validation failed",
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    },
  });
}

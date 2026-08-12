import { ErrorRequestHandler } from "express";
import APIError from "../errors/APIError.js";
import { ERROR_MESSAGES } from "../utils/constants.js";

export const catchError: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  console.error(err);

  // Custom API Error
  if (err instanceof APIError) {
    res.status(err.status).json({
      success: false,
      message: err.message,
      cause: err.cause ?? null,
    });
    return;
  }

  // MySQL Duplicate Entry Error
  if (err.code === "ER_DUP_ENTRY") {
    res.status(409).json({
      success: false,
      message: "Record already exists.",
    });
    return;
  }

  // MySQL Foreign Key Constraint Error (Row is referenced)
  if (
    err.code === "ER_ROW_IS_REFERENCED_2" ||
    err.code === "ER_ROW_IS_REFERENCED" ||
    err.errno === 1451
  ) {
    res.status(409).json({
      success: false,
      message: "Cannot delete or update record because it is referenced by other items in the system.",
    });
    return;
  }

  // Invalid JWT
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
    return;
  }

  // Expired JWT
  if (err.name === "TokenExpiredError") {
    res.status(401).json({
      success: false,
      message: "Token has expired.",
    });
    return;
  }

  // Joi Validation Error (fallback)
  if (err.name === "ValidationError") {
    res.status(422).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Unknown Error
  res.status(500).json({
    success: false,
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
  });
};
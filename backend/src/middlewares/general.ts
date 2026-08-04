import { NextFunction, Response } from "express";

import APIError from "../errors/APIError.js";
import { AuthRequest } from "./authenticate.js";
import { ERROR_MESSAGES } from "../utils/constants.js";

// Check if user is logged in
export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "USER_NOT_AUTHENTICATED"
      )
    );
  }

  next();
};

// Allow only Admin
export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "USER_NOT_AUTHENTICATED"
      )
    );
  }

  if (req.user.role !== "admin") {
    return next(
      new APIError(
        ERROR_MESSAGES.FORBIDDEN,
        403,
        "ADMIN_ACCESS_REQUIRED"
      )
    );
  }

  next();
};

// Allow only User
export const userOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "USER_NOT_AUTHENTICATED"
      )
    );
  }

  if (req.user.role !== "user") {
    return next(
      new APIError(
        ERROR_MESSAGES.FORBIDDEN,
        403,
        "USER_ACCESS_REQUIRED"
      )
    );
  }

  next();
};
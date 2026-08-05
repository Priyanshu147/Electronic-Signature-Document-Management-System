import { NextFunction, Response } from "express";

import APIError from "../errors/APIError.js";

import { AuthRequest } from "./authenticate.js";

import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  USER_ROLE,
} from "../utils/constants.js";

/* ===========================================================
   Check Authentication
=========================================================== */

export function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        "USER_NOT_AUTHENTICATED"
      )
    );
  }

  next();
}

/* ===========================================================
   Admin Only
=========================================================== */

export function adminOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        "USER_NOT_AUTHENTICATED"
      )
    );
  }

  if (req.user.role !== USER_ROLE.ADMIN) {
    return next(
      new APIError(
        ERROR_MESSAGES.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN,
        "ADMIN_ACCESS_REQUIRED"
      )
    );
  }

  next();
}

/* ===========================================================
   User Only
=========================================================== */

export function userOnly(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        "USER_NOT_AUTHENTICATED"
      )
    );
  }

  if (req.user.role !== USER_ROLE.USER) {
    return next(
      new APIError(
        ERROR_MESSAGES.FORBIDDEN,
        HTTP_STATUS.FORBIDDEN,
        "USER_ACCESS_REQUIRED"
      )
    );
  }

  next();
}
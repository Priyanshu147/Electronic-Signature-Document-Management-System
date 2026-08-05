// src/middlewares/authenticate.ts

import { NextFunction, Request, Response } from "express";

import APIError from "../errors/APIError.js";

import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  TOKEN_NAMES,
} from "../utils/constants.js";

import {
  getAccessToken,
  setAccessTokenCookie,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/helper.js";

export interface AuthUser {
  id: number;
  role: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const accessToken =
      req.cookies[TOKEN_NAMES.ACCESS_TOKEN];

    const refreshToken =
      req.cookies[TOKEN_NAMES.REFRESH_TOKEN];

    // Refresh token is mandatory
    if (!refreshToken) {
      return next(
        new APIError(
          ERROR_MESSAGES.UNAUTHORIZED,
          HTTP_STATUS.UNAUTHORIZED,
          "REFRESH_TOKEN_MISSING"
        )
      );
    }

    // -------------------------------------------------------
    // Try Access Token
    // -------------------------------------------------------

    if (accessToken) {
      try {
        const decoded =
          verifyAccessToken(accessToken) as AuthUser;

        req.user = decoded;

        return next();
      } catch (error: any) {
        // Ignore only expired access token
        if (error.name !== "TokenExpiredError") {
          return next(
            new APIError(
              ERROR_MESSAGES.UNAUTHORIZED,
              HTTP_STATUS.UNAUTHORIZED,
              error.message
            )
          );
        }
      }
    }

    // -------------------------------------------------------
    // Access Token Expired
    // Verify Refresh Token
    // -------------------------------------------------------

    const decodedRefresh =
      verifyRefreshToken(refreshToken) as AuthUser;

    // Create New Access Token
    const newAccessToken = getAccessToken(
      decodedRefresh.id,
      decodedRefresh.role
    );

    // Update Cookie
    setAccessTokenCookie(res, newAccessToken);

    req.user = decodedRefresh;

    return next();
  } catch (error: any) {
    return next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        HTTP_STATUS.UNAUTHORIZED,
        error.message
      )
    );
  }
};

export default authenticate;
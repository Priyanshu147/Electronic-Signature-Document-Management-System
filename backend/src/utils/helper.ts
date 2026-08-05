// src/utils/helper.ts

import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import path from "path";
import { Response } from "express";

import {
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  TOKEN_NAMES,
} from "./constants.js";

/* ===========================================================
   JWT
=========================================================== */

export function getAuthToken(
  userId: number,
  role: string
) {
  const payload = {
    id: userId,
    role,
  };

  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );

  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET!,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );

  return {
    accessToken,
    refreshToken,
  };
}

export function getAccessToken(
  userId: number,
  role: string
): string {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_ACCESS_SECRET!,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
}

export function verifyAccessToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,
    process.env.JWT_ACCESS_SECRET!
  ) as JwtPayload;
}

export function verifyRefreshToken(
  token: string
): JwtPayload {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!
  ) as JwtPayload;
}

/* ===========================================================
   PASSWORD
=========================================================== */

export async function hashPassword(
  password: string
): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/* ===========================================================
   COOKIE
=========================================================== */

export function setAccessTokenCookie(
  res: Response,
  token: string
): void {
  res.cookie(TOKEN_NAMES.ACCESS_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 15,
  });
}

export function setRefreshTokenCookie(
  res: Response,
  token: string
): void {
  res.cookie(TOKEN_NAMES.REFRESH_TOKEN, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

export function clearCookies(
  res: Response
): void {
  res.clearCookie(TOKEN_NAMES.ACCESS_TOKEN);
  res.clearCookie(TOKEN_NAMES.REFRESH_TOKEN);
}

/* ===========================================================
   PAGINATION
=========================================================== */

export function getPagination(
  page = 1,
  limit = 10
) {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

/* ===========================================================
   FILTERS
=========================================================== */

export function getFilterParams(query: any) {
  return {
    page: Number(query.page) || 1,
    limit: Number(query.limit) || 10,
    searchText: query.searchText ?? "",
    status: query.status ?? null,
  };
}

/* ===========================================================
   FILE HELPERS
=========================================================== */

export function generateFileName(
  originalName: string
): string {
  const extension = path.extname(originalName);

  return `${Date.now()}-${crypto.randomUUID()}${extension}`;
}

export function getFileExtension(
  filename: string
): string {
  return path.extname(filename).replace(".", "");
}

export function formatBytes(
  bytes: number
): string {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;

  const sizes = [
    "Bytes",
    "KB",
    "MB",
    "GB",
    "TB",
  ];

  const i = Math.floor(
    Math.log(bytes) / Math.log(k)
  );

  return `${parseFloat(
    (bytes / Math.pow(k, i)).toFixed(2)
  )} ${sizes[i]}`;
}

/* ===========================================================
   DATE
=========================================================== */

export function getCurrentDateTime(): Date {
  return new Date();
}

/* ===========================================================
   RANDOM
=========================================================== */

export function generateRandomString(
  length = 32
): string {
  return crypto.randomBytes(length).toString("hex");
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/* ===========================================================
   RESPONSE
=========================================================== */

export function successResponse(
  res: Response,
  message: string,
  data: unknown = null,
  status = 200
) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(
  res: Response,
  message: string,
  status = 400
) {
  return res.status(status).json({
    success: false,
    message,
  });
}
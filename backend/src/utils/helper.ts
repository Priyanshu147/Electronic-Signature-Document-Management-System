import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { ACCESS_TOKEN_EXPIRY } from "./constants.js";

// JWT
export function generateToken(userId: number) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
}

// Password Hash
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Compare Password
export async function comparePassword(
  password: string,
  hash: string
) {
  return bcrypt.compare(password, hash);
}

// Pagination
export function getPagination(
  page = 1,
  limit = 10
) {
  return {
    limit,
    offset: (page - 1) * limit,
  };
}

// Success Response
export function successResponse(
  res: any,
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

// Error Response
export function errorResponse(
  res: any,
  message: string,
  status = 400
) {
  return res.status(status).json({
    success: false,
    message,
  });
}
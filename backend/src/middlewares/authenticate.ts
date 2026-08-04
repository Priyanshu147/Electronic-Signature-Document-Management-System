import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import APIError from "../errors/APIError.js";
import { ERROR_MESSAGES } from "../utils/constants.js";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "JWT_MISSING"
      );
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    next(
      new APIError(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        error
      )
    );
  }
};

export default authenticate;
import { NextFunction, Request, Response } from "express";

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const catchAsync =
  (callback: AsyncController) =>
  (req: Request, res: Response, next: NextFunction): void => {
    callback(req, res, next).catch(next);
  };

export default catchAsync;
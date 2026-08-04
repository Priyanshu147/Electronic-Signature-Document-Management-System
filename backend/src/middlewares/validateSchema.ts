import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError } from "zod";

const validateSchema =
  <T>(schema: ZodSchema<T>, validateParams = false) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = validateParams ? req.params : req.body;

      const result = schema.parse(data);

      if (validateParams) {
        req.params = result as typeof req.params;
      } else {
        req.body = result;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(422).json({
          success: false,
          message: "Validation Failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        });
        return;
      }

      next(error);
    }
  };

export default validateSchema;
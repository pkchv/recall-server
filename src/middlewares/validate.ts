import boom from "boom";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator/check";

function validate(error: boom) {
  return (req: Request, res: Response, next: NextFunction) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      error.data = validationErrors.array();
      return next(error);
    }

    return next();
  };
}

export { validate };

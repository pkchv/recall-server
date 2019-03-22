import boom from "boom";
import { NextFunction, Request, Response } from "express";
import passport from "passport";

import { log } from "../common/logger";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const customErrorCallback = (error, user, info) => {
      if (error || info) {
        if (error) {
          log.error(error);
        }

        next(boom.unauthorized());
      } else {
        req.user = user;
        next();
      }
    };

    return passport.authenticate("jwt", { session: false, failWithError: true },
                                 customErrorCallback)(req, res, next);
}

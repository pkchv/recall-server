import async from "async";
import { NextFunction, Request, Response } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export function middlewareChain(
  middlewares: Middleware[],
  context?) {
  return (req: Request, res: Response, next: NextFunction) => {
    async.eachSeries(middlewares, (middleware, nextMiddleware) => {
      middleware.bind(context, req, res, nextMiddleware)();
    }, (error) => next(error));
  };
}

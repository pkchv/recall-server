import boom from "boom";
import { NextFunction, Request, Response } from "express";
import status from "http-status";

import { log } from "../common/logger";

function notFound(req: Request, res: Response, next: NextFunction) {
  log.error(req);
  return next(boom.notFound());
}

function catchInternal(next, error) {
  if (error) {
    log.error(error);
  }

  return next(boom.internal());
}

function onError(error: any, req: Request, res: Response, next: NextFunction) {
  if (boom.isBoom(error)) {
    log.error(error.message);
    res.status(error.output.statusCode).json(error.output.payload);
  } else {
    log.error(error);
    res.status(status.INTERNAL_SERVER_ERROR).json(boom.internal().output.payload);
  }
}

export { notFound, onError, catchInternal };

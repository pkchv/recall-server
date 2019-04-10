import boom from "boom";
import { NextFunction } from "connect";

export function entityNotFound(entity: any, next: NextFunction) {
  if (entity === undefined) {
    return next(boom.notFound());
  }

  return Promise.resolve(entity);
}

import { Container } from "typedi";

import { AuthController } from "./controllers/auth.controller";
import { UsersController } from "./controllers/users.controller";
import { IController } from "./interfaces/IController";

export function createRoutes(instanceId?: string): IController[] {
  const users = Container.of(instanceId).get(UsersController);
  const auth = Container.of(instanceId).get(AuthController);
  return [users, auth];
}

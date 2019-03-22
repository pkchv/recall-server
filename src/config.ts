import { Container } from "typedi";

import { AuthConfiguration } from "./config/auth.config";
import { GeneralConfiguration } from "./config/general.config";
import { SecurityConfiguration } from "./config/security.config";
import { IConfiguration } from "./interfaces/IConfiguration";

export function createConfiguration(instanceId?: string): IConfiguration[] {
  const security = Container.of(instanceId).get(SecurityConfiguration);
  const general = Container.of(instanceId).get(GeneralConfiguration);
  const auth = Container.of(instanceId).get(AuthConfiguration);
  return [security, general, auth];
}

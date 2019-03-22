import pino from "pino";
import { Container } from "typedi";

import { Environment } from "./environment";

const env = Container.get(Environment);

const log = pino({
  level: env.get("LOG_LEVEL", "silent"),
  name: env.get("APP_ID"),
});

export { log };

import "reflect-metadata";
import "./common/environment";

import dotenv from "dotenv";
import { Container } from "typedi";
import { createConnection, useContainer } from "typeorm";

import { App } from "./common/application";

async function bootstrap() {
  dotenv.config();
  useContainer(Container);
  await createConnection();
  const app = Container.get(App);
  const { createConfiguration } = require("./config");
  const { createRoutes } = require("./routes");
  app
    .use(createConfiguration())
    .use(createRoutes())
    .run();
}

bootstrap();

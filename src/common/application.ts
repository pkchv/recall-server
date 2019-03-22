import express, { Application } from "express";
import http from "http";
import os from "os";
import { Inject, Service } from "typedi";

import { IConfiguration } from "../interfaces/IConfiguration";
import { IController } from "../interfaces/IController";
import { notFound, onError } from "../middlewares/error";
import { Environment } from "./environment";
import { log } from "./logger";

@Service("app")
export class App {

  private readonly app: Application;

  constructor(
    @Inject("environment") private readonly env: Environment,
  ) {
    this.app = express();
  }

  public use(components: IConfiguration | IController | IConfiguration[] | IController[]): App {
    if (!(components instanceof Array)) {
      components = [components];
    }

    components.map((component) => component.mount(this.app));
    return this;
  }

  public run() {
    const port = parseInt(this.env.get("PORT", "3000"), 10);
    const welcome = () => {
      return () => {
        log.info(`up and running in ${process.env.NODE_ENV || "development"}` +
        `@${os.hostname()} on port: ${port}`);
      };
    };

    this.app.use(notFound, onError);

    http
      .createServer(this.app)
      .listen(port, welcome());
  }
}

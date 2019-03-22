import { Application } from "express";
import helmet from "helmet";

import { IConfiguration } from "../interfaces/IConfiguration";

export class SecurityConfiguration implements IConfiguration {
  public mount(app: Application) {
    app.use(helmet());
  }
}

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Application } from "express";
import expressValidator from "express-validator";
import { Inject } from "typedi";

import { Environment } from "../common/environment";
import { IConfiguration } from "../interfaces/core/IConfiguration";

export class GeneralConfiguration implements IConfiguration {
  constructor(
    @Inject("environment") private readonly env: Environment,
  ) {}

  public mount(app: Application) {
    app.use(bodyParser.json({
      limit: this.env.get("REQUEST_LIMIT", "100kb"),
      type: () => true,
    }));

    app.use(bodyParser.urlencoded({
      extended: true,
      limit: this.env.get("REQUEST_LIMIT", "100kb"),
    }));

    app.use(cookieParser(this.env.get("SESSION_SECRET")));
    app.use(expressValidator());
  }
}

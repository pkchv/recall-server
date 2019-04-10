import { Application, Router } from "express";

import { IController } from "../interfaces/core/IController";
import { onError } from "../middlewares/error";

abstract class Controller implements IController {
  protected $routes: any;

  private readonly router: Router;

  constructor() {
    this.router = Router();
    for (const {method, url, middleware, fnName} of this.$routes) {
      this.router[method](url, ...middleware, this[fnName].bind(this));
    }
  }

  public mount(app: Application) {
    app.use(this.router, onError);
  }
}

export { Controller };

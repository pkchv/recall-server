import boom from "boom";
import { NextFunction, Request, Response } from "express";
import { controller, post } from "route-decorators";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { log } from "../common/logger";
import { catchInternal } from "../middlewares/error";
import { validate } from "../middlewares/validate";
import { UsersRepository } from "../repositories/users.repository";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";
import { includes } from "../utility/includes";
import { middlewareChain } from "../utility/middleware-chain";
import { AuthValidator } from "../validators/auth.validator";
import { Controller } from "./base.controller";

@Service("auth.controller")
@controller()
export class AuthController extends Controller {

  private readonly REQUIRED_KEYS_LOGIN = ["username", "password"];

  constructor(
    @InjectRepository() private readonly users: UsersRepository,
    @Inject("auth.service") private readonly auth: AuthService,
    @Inject("token.service") private readonly token: TokenService,
    @Inject("auth.validator") private readonly validator: AuthValidator,
  ) {
    super();
  }

  @post("/login")
  public login(req: Request, res: Response, next: NextFunction) {
    return middlewareChain([
      this.validator.checkPostLogin.bind(this.validator),
      validate(boom.badRequest("Request validation error")),
      this._login.bind(this),
    ])(req, res, next);
  }

  public _login(req: Request, res: Response, next: NextFunction) {
    if (!includes(req.body, this.REQUIRED_KEYS_LOGIN)) {
      log.error("Required keys are missing");
      return next(boom.internal());
    }

    const { username, password } = req.body;

    this.users.getByUsername(username)
      .then((user) => {

        if (user === undefined) {
          return next(boom.notFound("User does not exist"));
        }

        const { id } = user;

        this.auth.authenticateByUsername(username, password)
          .then((authenticated) => {
            if (authenticated) {
              const token = this.token.sign(id);
              res.json({ token });
            } else {
              return next(boom.unauthorized("Incorrect username or password"));
            }
          })
          .catch((error) => catchInternal(next, error));
      })
      .catch((error) => catchInternal(next, error));
  }
}

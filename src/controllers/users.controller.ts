import boom from "boom";
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { controller, get, post } from "route-decorators";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { User } from "../database/entities/User";
import { authenticate } from "../middlewares/authenticate";
import { catchInternal } from "../middlewares/error";
import { validate } from "../middlewares/validate";
import { UsersRepository } from "../repositories/users.repository";
import { includes } from "../utility/includes";
import { middlewareChain } from "../utility/middleware-chain";
import { UsersValidator } from "../validators/users.validator";
import { Controller } from "./base.controller";

@Service("users.controller")
@controller()
export class UsersController extends Controller {

  private readonly REQUIRED_KEYS_REGISTER = ["username", "password", "email"];
  private readonly REQUIRED_KEYS_USER = ["id", "username", "email"];

  constructor(
    @InjectRepository() private readonly users: UsersRepository,
    @Inject("users.validator") private readonly validator: UsersValidator,
  ) {
    super();
  }

  @post("/register")
  public register(req: Request, res: Response, next: NextFunction) {
    return middlewareChain([
      this.validator.checkPostRegister.bind(this.validator),
      validate(boom.badRequest("Request validation error")),
      this.validator.uniquePostRegister.bind(this.validator),
      validate(boom.conflict("Username or email is taken")),
      this._register.bind(this),
    ])(req, res, next);
  }

  public _register(req: Request, res: Response, next: NextFunction) {

    if (!includes(req.body, this.REQUIRED_KEYS_REGISTER)) {
      return next(boom.internal());
    }

    const { username, password, email } = req.body;
    const user = new User({ username, password, email });

    this.users.save(user)
      .then(() => res.sendStatus(status.CREATED))
      .catch((error) => catchInternal(next, error));

  }

  @get("/user", authenticate)
  public user(req: Request, res: Response, next: NextFunction) {

    if (!includes(req, "user") || !includes(req.user, this.REQUIRED_KEYS_USER)) {
      return next(boom.internal());
    }

    const { id, username, email } = req.user;
    res.json({ id, username, email });

  }
}

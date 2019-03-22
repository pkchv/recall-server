import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";

import { middlewareChain } from "../utility/middleware-chain";
import { PasswordValidator } from "./properties/password.validator";
import { UsernameValidator } from "./properties/username.validator";

@Service("auth.validator")
export class AuthValidator {

  constructor(
    @Inject("username.property.validator") private username: UsernameValidator,
    @Inject("password.property.validator") private password: PasswordValidator,
  ) {}

  public checkPostLogin(req: Request, res: Response, next: NextFunction) {
    return middlewareChain([
      this.username.check(),
      this.password.check(),
    ], this)(req, res, next);
  }
}

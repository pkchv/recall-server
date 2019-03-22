import { NextFunction, Request, Response } from "express";
import { Inject, Service } from "typedi";

import { middlewareChain } from "../utility/middleware-chain";
import { EmailValidator } from "./properties/email.validator";
import { PasswordValidator } from "./properties/password.validator";
import { UsernameValidator } from "./properties/username.validator";

@Service("users.validator")
export class UsersValidator {

  constructor(
    @Inject("username.property.validator") private readonly username: UsernameValidator,
    @Inject("email.property.validator") private readonly email: EmailValidator,
    @Inject("password.property.validator") private readonly password: PasswordValidator,
  ) {}

  public uniquePostRegister(req: Request, res: Response, next: NextFunction) {
    return middlewareChain([
      this.username.unique(),
      this.email.unique(),
    ], this)(req, res, next);
  }

  public checkPostRegister(req: Request, res: Response, next: NextFunction) {
    return middlewareChain([
      this.username.check(),
      this.email.check(),
      this.password.check(),
    ], this)(req, res, next);
  }
}

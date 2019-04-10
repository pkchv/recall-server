import boom from "boom";
import { Application } from "express";
import passport from "passport";
import passportJwt from "passport-jwt";
import { Inject } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Environment } from "../common/environment";
import { log } from "../common/logger";
import { User } from "../entities/User";
import { IConfiguration } from "../interfaces/core/IConfiguration";
import { UsersRepository } from "../repositories/users.repository";

export class AuthConfiguration implements IConfiguration {

  private readonly JWT_SECRET: string;

  constructor(
    @Inject("environment") private readonly env: Environment,
    @InjectRepository() private readonly users: UsersRepository,
  ) {
    this.JWT_SECRET = this.env.getOrFail("JWT_SECRET");
  }

  public mount(app: Application) {
    passport.use(this.createStrategy());
    app.use(passport.initialize());
  }

  private createStrategy() {
    return new passportJwt.Strategy(this.createOptions(),
                                    this.createAuthCallback());
  }

  private createOptions() {
    return {
      jwtFromRequest: passportJwt.ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.JWT_SECRET,
    };
  }

  private createAuthCallback() {
    return (jwtPayload, next) => {
      this.users.getById(jwtPayload.id)
      .then((user: User) => {
        if (user === undefined) {
          next(boom.unauthorized(), false);
        }
        next(null, user);
      })
      .catch((error) => {
        log.error(error);
        next(boom.internal(), false);
      });
    };
  }
}

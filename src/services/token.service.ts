import jsonwebtoken from "jsonwebtoken";
import { Inject, Service } from "typedi";

import { Environment } from "../common/environment";

@Service("token.service")
export class TokenService {

  private readonly JWT_SECRET: string;

  constructor(
    @Inject("environment") private readonly env: Environment,
  ) {
    this.JWT_SECRET = this.env.getOrFail("JWT_SECRET");
  }

  public sign(userId: number) {
    return jsonwebtoken.sign({ id: userId }, this.JWT_SECRET);
  }
}

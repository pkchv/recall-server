import crypto from "crypto";
import safeCompare from "safe-compare";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { log } from "../common/logger";
import { UsersRepository } from "../repositories/users.repository";

@Service("auth.service")
export class AuthService {

  constructor(
    @InjectRepository() private readonly users: UsersRepository,
  ) {}

  public async authenticateByUsername(username: string, password: string): Promise<boolean> {
    try {
      const { hash, salt } = await this.users.findOneOrFail({
        username,
      });

      return this.validatePassword(hash, salt, password);
    } catch (error) {
      log.error(error);
    }

    return false;
  }

  public async authenticateByEmail(email: string, password: string): Promise<boolean> {
    try {
      const { hash, salt } = await this.users.findOneOrFail({
        email,
      });

      return this.validatePassword(hash, salt, password);
    } catch (error) {
      log.error(error);
    }

    return false;
  }

  private validatePassword(hash: string, salt: string, password: string) {
    const hash2 = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
    return Promise.resolve(safeCompare(hash, hash2));
  }
}

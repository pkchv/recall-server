import { EntityRepository, Repository } from "typeorm";
import normalizeEmail from "validator/lib/normalizeEmail";

import { User } from "../database/entities/User";

@EntityRepository(User)
export class UsersRepository extends Repository<User> {

  public getById(id: number): Promise<User> {
    return this.findOne(id);
  }

  public getByUsername(username: string): Promise<User> {
    return this.findOne({
      where: { username },
    });
  }

  public getByEmail(email: string): Promise<User> {
    const normalizedEmail = normalizeEmail(email);
    return this.findOne({
      where: { email: normalizedEmail },
    });
  }

  public updateById(id: number, updates: object): Promise<User> {
    if (updates.hasOwnProperty("email")) {
      (updates as any).email = normalizeEmail((updates as any).email);
    }

    this.update(id, updates);
    return this.findOne(id);
  }

  public async removeById(id: number): Promise<User> {
    const user = await this.findOne(id);

    if (user === undefined) {
      return undefined;
    }

    return this.remove(user);
  }

}

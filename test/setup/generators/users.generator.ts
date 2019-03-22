import { getRepository } from "typeorm";

import { User } from "../../../src/database/entities/User";
import { IUserDto } from "../../../src/interfaces/IUserDto";

export class UsersGenerator {
  public create(): IUserDto {
    return {
      email: "user@domain.com",
      password: "Password0",
      username: "username",
    };
  }

  public async insert(data: IUserDto): Promise<User> {
    const user = new User(data);
    return getRepository(User).save(user);
  }
}

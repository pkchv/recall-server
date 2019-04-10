import { Container } from "typedi";
import { getRepository } from "typeorm";

import { User } from "../../../src/entities/User";
import { IUserDto } from "../../../src/interfaces/dto/IUserDto";
import { TokenService } from "../../../src/services/token.service";

export class UsersGenerator {

  constructor(private readonly instanceId?: string) {}

  public create(username: string = "username",
                email: string = "user@domain.com",
                password: string = "Password0"): IUserDto {
    return {
      email,
      password,
      username,
    };
  }

  public async insert(data?: IUserDto): Promise<User> {
    if (data === undefined) {
      data = this.create();
    }

    const user = new User(data);
    return getRepository(User).save(user);
  }

  public getToken(user: User) {
    return Container
      .of(this.instanceId)
      .get(TokenService)
      .sign(user.id);
  }

}

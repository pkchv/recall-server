import { body } from "express-validator/check";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UsersRepository } from "../../repositories/users.repository";

@Service("email.property.validator")
export class EmailValidator {

  private readonly DEFAULT_PROPERTY = "email";

  constructor(
    @InjectRepository() private readonly usersRepository: UsersRepository,
  ) {}

  public unique(field = this.DEFAULT_PROPERTY) {
    return body(field).custom((email) => {
      return this.usersRepository.getByEmail(email)
      .then((user) => {
        if (user) {
          return Promise.reject("This email address is already taken.");
        }
      });
    });
  }

  public check(field = this.DEFAULT_PROPERTY) {
    return body(field).exists().isEmail();
  }
}

import { body } from "express-validator/check";
import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";

import { UsersRepository } from "../../repositories/users.repository";

@Service("username.property.validator")
export class UsernameValidator {

  private readonly DEFAULT_PROPERTY = "username";

  constructor(
    @InjectRepository() private readonly usersRepository: UsersRepository,
  ) {}

  public unique(field = this.DEFAULT_PROPERTY) {
    return body(field).custom((username) => {
      return this.usersRepository.getByUsername(username)
      .then((user) => {
        if (user) {
          return Promise.reject("This username is already taken.");
        }
      });
    });
  }

  public check(field = this.DEFAULT_PROPERTY) {
    return body(field)
      .exists()
      .isLength({ min: 5, max: 32 })
      .matches(/^[a-zA-Z0-9_]+$/, "i")
      .withMessage("Username can only contain lowercase and uppercase letters," +
      "numbers and an underscore character.");
  }
}

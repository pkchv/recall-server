import { body } from "express-validator/check";
import passwordValidator from "password-validator";
import { Service } from "typedi";

@Service("password.property.validator")
export class PasswordValidator {

  private readonly DEFAULT_PROPERTY = "password";

  public check(field = this.DEFAULT_PROPERTY) {
    return body(field)
      .exists()
      .custom(this.createPasswordPolicyCheck())
      .withMessage("Password should be at least 8 characters long," +
      " at most 64 characters long, containt at least one lowercase letter," +
      " one uppercase letter and one digit.");
  }

  private createPasswordPolicyCheck() {
    const schema = new passwordValidator();
    schema
      .is().min(8)
      .is().max(64)
      .has().lowercase()
      .has().uppercase()
      .has().digits()
      .has().not().spaces();
    return (password) => schema.validate(password);
  }
}

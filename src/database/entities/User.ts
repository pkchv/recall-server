import crypto from "crypto";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import normalizeEmail from "validator/lib/normalizeEmail";

import { IUserDto } from "../../interfaces/IUserDto";

@Entity()
export class User {

  private static normalizeEmail(email: string): string {
    return normalizeEmail(email);
  }

  private static createSalt(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  private static createHash(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public username: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public hash: string;

  @Column()
  public salt: string;

  @Column()
  public created: Date;

  @Column()
  public modified: Date;

  constructor(user?: IUserDto) {
    if (user !== undefined) {
      this.username = user.username;
      this.email = User.normalizeEmail(user.email);
      this.created = user.created || new Date();
      this.modified = user.modified || new Date();
      this.salt = User.createSalt();
      this.hash = User.createHash(user.password, this.salt);
    }
  }
}

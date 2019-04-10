import crypto from "crypto";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import normalizeEmail from "validator/lib/normalizeEmail";

import { IUserDto } from "../interfaces/dto/IUserDto";

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

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  constructor(user?: IUserDto) {
    if (user !== undefined) {
      this.username = user.username;
      this.email = User.normalizeEmail(user.email);
      this.salt = User.createSalt();
      this.hash = User.createHash(user.password, this.salt);
    }
  }
}

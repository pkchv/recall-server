import dotenv from "dotenv";
import { Service } from "typedi";

interface IEnvObject { [k: string]: string; }

@Service("environment")
export class Environment {

  private readonly TEST_ENV: string = "test";
  private readonly runtimeOverrides: IEnvObject;

  constructor(runtimeOvverides?: IEnvObject) {
    this.runtimeOverrides = runtimeOvverides !== undefined
      ? runtimeOvverides
      : Object.create(null);

    if (process.env.NODE_ENV !== this.TEST_ENV) {
      dotenv.config();
    }
  }

  public get(property: string, defaultValue: string = ""): string {
    if (this.runtimeOverrides[property] !== undefined) {
      return this.runtimeOverrides[property];
    }

    if (process.env[property] !== undefined) {
      return process.env[property];
    }

    return defaultValue;
  }

  public getOrFail(property: string) {
    if (this.runtimeOverrides[property] === undefined && process.env[property] === undefined) {
      throw new Error(`Environment variable: '${property}' is missing.`);
    }

    if (this.runtimeOverrides[property] !== undefined) {
      return this.runtimeOverrides[property];
    }

    return process.env[property];
  }
}

import { Application } from "express";

export interface IConfiguration {
  mount: (app: Application) => void;
}

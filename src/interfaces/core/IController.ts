import { Application } from "express";

export interface IController {
  mount: (app: Application) => void;
}

import { Application } from "express";
import Container from "typedi";

import { Environment } from "../../src/common/environment";
import { createConfiguration } from "../../src/config";
import { Controller } from "../../src/controllers/base.controller";

export function setEnvironment(instanceId: string, env: Environment) {
  Container
    .of(instanceId)
    .set("environment", env);
}

export function mountConfiguration(instanceId: string, app: Application) {
  createConfiguration(instanceId)
    .map((config) => config.mount(app));
}

export function mountController<T extends Controller>(instanceId: string, app: Application, type: any) {
  Container
    .of(instanceId)
    .get<T>(type)
    .mount(app);
}

export function resetContainer(instanceId: string) {
  Container
    .of(instanceId)
    .reset();
}

import "mocha";
import "reflect-metadata";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import express from "express";
import status from "http-status";
import request from "supertest";
import { Container } from "typedi";
import { useContainer } from "typeorm";
import uuid from "uuid/v1";

import { Environment } from "../../../src/common/environment";
import { AuthController } from "../../../src/controllers/auth.controller";
import { User } from "../../../src/entities/User";
import { mountConfiguration, mountController, resetContainer, setEnvironment } from "../../setup/container-helpers";
import { expectErrorPost } from "../../setup/expect-api-error";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("auth.controller integration tests", function() {
  const instanceId = uuid();
  const db = new TestDatabase();
  const env = new Environment({ JWT_SECRET: "jwtsecret" });
  setEnvironment(instanceId, env);
  const generator = new UsersGenerator(instanceId);
  let app = null;

  beforeEach(async function() {
    app = express();
    useContainer(Container);
    await db.createConnection({ entities: [User] });
    setEnvironment(instanceId, env);
    mountConfiguration(instanceId, app);
    mountController(instanceId, app, AuthController);
  });

  afterEach(async function() {
    await db.close();
    resetContainer(instanceId);
  });

  describe("POST /login", function() {
    it("Bad Request (400) - malformed body", function() {
      const endpoint = "/login";
      const payload = {
        foo: "bar",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - username property is missing", function() {
      const endpoint = "/login";
      const payload = {
        password: "Password0",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - password property is missing", function() {
      const endpoint = "/login";
      const payload = {
        username: "username",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - username property is too short", function() {
      const endpoint = "/login";
      const payload = {
        username: "user",
        password: "Password0",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - password property is too short", function() {
      const endpoint = "/login";
      const payload = {
        username: "username",
        password: "Pass0",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - password property is missing a number", function() {
      const endpoint = "/login";
      const payload = {
        username: "username",
        password: "Password",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - password property is missing an uppercase letter", function() {
      const endpoint = "/login";
      const payload = {
        username: "username",
        password: "password0",
      };
      const code = status.BAD_REQUEST;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Not Found (404) - user does not exist", function() {
      const endpoint = "/login";
      const payload = {
        username: "username",
        password: "Password0",
      };
      const code = status.NOT_FOUND;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Unauthorized (403) - incorrect password", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const { username, password } = userData;
      const endpoint = "/login";
      const payload = {
        username,
        password: password + "123",
      };
      const code = status.UNAUTHORIZED;

      return expectErrorPost(app, endpoint, payload, code);
    });

    it("OK (200) - should respond with a token", async function() {
      const userData = generator.create();
      await generator.insert(userData);

      const endpoint = "/login";
      const payload = {
        username: userData.username,
        password: userData.password,
      };
      const code = status.OK;

      return request(app)
        .post(endpoint)
        .send(payload)
        .expect("Content-Type", /json/)
        .expect(code)
        .then((res) => {
          expect(res.body).to.have.property("token");
        });
    });
  });
});

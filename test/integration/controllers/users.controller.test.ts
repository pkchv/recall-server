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
import { createConfiguration } from "../../../src/config";
import { AuthController } from "../../../src/controllers/auth.controller";
import { UsersController } from "../../../src/controllers/users.controller";
import { User } from "../../../src/database/entities/User";
import { expectApiError } from "../../setup/expect-api-error";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("users.controller integration tests", function() {
  const db = new TestDatabase();
  const generator = new UsersGenerator();
  const instanceId = uuid();
  let app = null;

  beforeEach(async function() {
    Container
      .of(instanceId)
      .set("environment", new Environment({
        JWT_SECRET: "jwtsecret",
    }));

    useContainer(Container);
    await db.createConnection({ entities: [User] });

    app = express();

    createConfiguration(instanceId)
      .map((config) => config.mount(app));

    Container
      .of(instanceId)
      .get(UsersController)
      .mount(app);
  });

  afterEach(async function() {
    await db.close();

    Container
      .of(instanceId)
      .reset();
  });

  describe("/register", function() {
    it("POST /register - Bad Request (400) - malformed payload", function() {
      const endpoint = "/register";
      const payload = {
        foo: "bar",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - username property is missing", function() {
      const endpoint = "/register";
      const payload = {
        email: "user@domain.com",
        password: "Password0",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - password property is missing", function() {
      const endpoint = "/register";
      const payload = {
        username: "username",
        email: "user@domain.com",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - email property is missing", function() {
      const endpoint = "/register";
      const payload = {
        username: "username",
        password: "Password0",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - username property is too short", function() {
      const endpoint = "/register";
      const payload = {
        username: "user",
        email: "user@domain.com",
        password: "pass",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - email property is an invalid email", function() {
      const endpoint = "/register";
      const payload = {
        username: "username",
        email: "@userdomain.com",
        password: "password",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - password property is too short", function() {
      const endpoint = "/register";
      const payload = {
        username: "username",
        email: "user@domain.com",
        password: "pass",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Bad Request (400) - password property is missing a number", function() {
      const endpoint = "/register";
      const payload = {
        username: "username",
        email: "user@domain.com",
        password: "password",
      };
      const code = status.BAD_REQUEST;

      return expectApiError(app, endpoint, payload, code);
    });

    it(
      "POST /register - Bad Request (400) - password property is missing an uppercase letter",
      function() {
        const endpoint = "/register";
        const payload = {
          username: "username",
          email: "user@domain.com",
          password: "password0",
        };
        const code = status.BAD_REQUEST;

        return expectApiError(app, endpoint, payload, code);
      });

    it("POST /register - Conflict (409) - username is taken", async function() {
      const userData = generator.create();
      await generator.insert(userData);

      const endpoint = "/register";
      const payload = {
        username: userData.username,
        email: "user@domain.com",
        password: "Password0",
      };
      const code = status.CONFLICT;

      return expectApiError(app, endpoint, payload, code);
    });

    it("POST /register - Conflict (409) - email is taken", async function() {
      const userData = generator.create();
      await generator.insert(userData);

      const endpoint = "/register";
      const payload = {
        username: "username2",
        email: userData.email,
        password: "Password0",
      };
      const code = status.CONFLICT;

      return expectApiError(app, endpoint, payload, code);
    });
  });

  describe("/user", function() {
    it("GET /user - Unauthorized (403) - unauthenticated user", function() {
      return request(app)
        .get("/user")
        .expect(status.UNAUTHORIZED)
        .then((res) => {
          expect(res.body).to.have.property("statusCode", status.UNAUTHORIZED);
          expect(res.body).to.have.property("error");
          expect(res.body).to.have.property("message");
        });
    });

    it("GET /user - OK (200) - authenticated user", async function() {
      Container
        .of(instanceId)
        .get(AuthController)
        .mount(app);

      const userData = generator.create();
      const user = await generator.insert(userData);

      return request(app)
        .post("/login")
        .send({ username: userData.username, password: userData.password })
        .expect("Content-Type", /json/)
        .expect(status.OK)
        .then((res) => {
          const token = res.body.token;
          return request(app)
            .get("/user")
            .set("Authorization", `Bearer ${token}`)
            .then((res2) => {
              expect(res2.body).to.have.property("id");
              expect(res2.body).to.have.property("email", user.email);
              expect(res2.body).to.have.property("username", user.username);
            });
        });
    });
  });
});

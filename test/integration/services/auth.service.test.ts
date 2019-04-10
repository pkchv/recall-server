import "mocha";
import "reflect-metadata";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Container } from "typedi";
import { useContainer } from "typeorm";
import uuid from "uuid/v1";

import { User } from "../../../src/entities/User";
import { AuthService } from "../../../src/services/auth.service";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("auth.service integration tests", function() {
  const db = new TestDatabase();
  const generator = new UsersGenerator();
  const containerId = uuid();
  let authService = null;

  beforeEach(async function() {
    useContainer(Container);
    await db.createConnection({ entities: [User] });
    authService = Container.of(containerId).get(AuthService);
  });

  afterEach(async function() {
    await db.close();
    Container.reset(containerId);
  });

  describe("#authenticateByUsername()", function() {
    it("should not authenticate user when user does not exist", async function() {
      const userData = generator.create();
      const result = authService.authenticateByUsername(userData.username,
                                                        userData.password);

      return expect(result).to.eventually.be.equal(false);
    });

    it("should not authenticate user when username is invalid", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const result = authService.authenticateByUsername(`${userData.username}1`,
                                                        userData.password);

      return expect(result).to.eventually.be.equal(false);
    });

    it("should not authenticate user when password is invalid", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const result = authService.authenticateByUsername(userData.username,
                                                        `${userData.password}1`);

      return expect(result).to.eventually.be.equal(false);
    });

    it("should authenticate when username and password is valid", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const result = authService.authenticateByUsername(userData.username,
                                                        userData.password);

      return expect(result).to.eventually.be.equal(true);
    });
  });

  describe("#authenticateByEmail()", function() {
    it("should not authenticate user when user does not exist", async function() {
      const userData = generator.create();
      const result = authService.authenticateByEmail(userData.email,
                                                     userData.password);

      return expect(result).to.eventually.be.equal(false);
    });

    it("should not authenticate user when username is invalid", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const result = authService.authenticateByEmail(`0${userData.email}`,
                                                     userData.password);

      return expect(result).to.eventually.be.equal(false);
    });

    it("should not authenticate user when password is invalid", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const result = authService.authenticateByEmail(userData.email,
                                                     `${userData.password}1`);

      return expect(result).to.eventually.be.equal(false);
    });

    it("should authenticate when username and password is valid", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const result = authService.authenticateByEmail(userData.email,
                                                     userData.password);

      return expect(result).to.eventually.be.equal(true);
    });
  });
});

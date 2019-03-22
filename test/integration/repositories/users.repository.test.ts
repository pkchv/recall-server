import "mocha";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Container } from "typedi";
import { useContainer } from "typeorm";

import { User } from "../../../src/database/entities/User";
import { UsersRepository } from "../../../src/repositories/users.repository";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("users.repository integration tests", function() {
  const db = new TestDatabase();
  const generator = new UsersGenerator();
  let usersRepository = null;

  beforeEach(async function() {
    useContainer(Container);
    const connection = await db.createConnection({ entities: [User] });
    usersRepository = connection.getCustomRepository(UsersRepository);
  });

  afterEach(async function() {
    await db.close();
  });

  describe("#getById()", function() {
    it("should return undefined when id is invalid", function() {
      return expect(usersRepository.getById(-1)).to.eventually.be.equal(undefined);
    });

    it("should return undefined when id does not exist", function() {
      return expect(usersRepository.getById(1)).to.eventually.be.equal(undefined);
    });

    it("should return a user when id exists", async function() {
      const userData = generator.create();
      const user = await generator.insert(userData);
      return expect(usersRepository.getById(1)).to.eventually.be.deep.equal(user);
    });
  });

  describe("#getByUsername()", function() {
    it("should return undefined when username does not exist", function() {
      return expect(usersRepository.getByUsername("user"))
        .to.eventually.be.equal(undefined);
    });

    it("should return a user when username exists", async function() {
      const userData = generator.create();
      const user = await generator.insert(userData);
      return expect(usersRepository.getByUsername(userData.username))
        .to.eventually.be.deep.equal(user);
    });
  });

  describe("#getByEmail()", function() {
    it("should return undefined when email does not exist", function() {
      return expect(usersRepository.getByEmail("user@domain.com"))
        .to.eventually.be.equal(undefined);
    });

    it("should return a user when email does exist", async function() {
      const userData = generator.create();
      const user = await generator.insert(userData);
      return expect(usersRepository.getByEmail(userData.email))
        .to.eventually.be.deep.equal(user);
    });
  });

  describe("#updateById()", function() {
    it("should return undefined when user does not exist", function() {
      return expect(usersRepository.updateById(1, { username: "user" }))
        .to.eventually.be.equal(undefined);
    });

    it("should update when user exists", async function() {
      const userData = generator.create();
      await generator.insert(userData);
      const updated = usersRepository.updateById(1, { username: "username5" });

      return expect(updated)
          .to.eventually.not.be.equal(undefined);
    });
  });

  describe("#removeById() - empty collection", function() {
    it("should return undefined when id is invalid", function() {
      return expect(usersRepository.removeById(-1))
        .to.eventually.be.equal(undefined);
    });

    it("should return undefined when user does not exist", function() {
      return expect(usersRepository.removeById(1))
        .to.eventually.be.equal(undefined);
    });
  });

  describe("#removeById() - non-empty collection", function() {
    beforeEach(async function() {
      const userData = generator.create();
      await generator.insert(userData);
    });

    it("should remove when user exist", async function() {
      const removed = usersRepository.removeById(1);
      return expect(removed)
        .to.eventually.not.be.equal(undefined);
    });

    it("should contain id property equal to undefined", async function() {
      const removed = usersRepository.removeById(1);
      return expect(removed)
        .to.eventually.have.property("id", undefined);
    });
  });
});

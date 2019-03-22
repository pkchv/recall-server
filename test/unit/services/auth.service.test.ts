import "mocha";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import crypto from "crypto";
import { stub } from "sinon";
import sinonChai from "sinon-chai";

import { AuthService } from "../../../src/services/auth.service";

use(sinonChai);
use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("auth.service unit tests", function() {
  let authService = null;
  let findOneOrFailStub = stub();

  const userRepository = {
    findOneOrFail: findOneOrFailStub,
  };

  beforeEach(function() {
    findOneOrFailStub = stub();
    userRepository.findOneOrFail = findOneOrFailStub;
    // @ts-ignore
    authService = new AuthService(userRepository);
  });

  describe("#authenticateByUsername()", function() {
    it("should return false when username lookup fails", function() {
      const username = "username";
      const password = "password";
      findOneOrFailStub.rejects();

      const authPromise = authService.authenticateByUsername(username, password);

      return expect(authPromise).to.eventually.be.equal(false);
    });

    it("should call findOneOrFail() once with username", async function() {
      const username = "username";
      const password = "password";
      findOneOrFailStub.rejects();

      await authService.authenticateByUsername(username, password);

      return expect(findOneOrFailStub)
        .to.be.calledOnceWith({ username });
    });

    it("should return true when password matches", function() {
      const username = "username";
      const password = "password";
      const salt = "000000000000";
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
      findOneOrFailStub.resolves({
        hash, salt,
      });

      const authPromise = authService.authenticateByUsername(username, password);

      return expect(authPromise).to.eventually.be.equal(true);
    });
  });

  describe("#authenticateByEmail()", function() {
    it("should return false when username lookup fails", function() {
      const email = "user@domain.com";
      const password = "password";
      findOneOrFailStub.rejects();

      const authPromise = authService.authenticateByEmail(email, password);

      return expect(authPromise).to.eventually.be.equal(false);
    });

    it("should call findOneOrFail() once with username", async function() {
      const email = "user@domain.com";
      const password = "password";
      findOneOrFailStub.rejects();

      await authService.authenticateByEmail(email, password);

      return expect(findOneOrFailStub)
        .to.be.calledOnceWith({ email });
    });

    it("should return true when password matches", function() {
      const email = "user@domain.com";
      const password = "password";
      const salt = "000000000000";
      const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
      findOneOrFailStub.resolves({
        hash, salt,
      });

      const authPromise = authService.authenticateByEmail(email, password);

      return expect(authPromise).to.eventually.be.equal(true);
    });
  });

});

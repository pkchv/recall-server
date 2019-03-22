import "mocha";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import status from "http-status";
import { createSandbox, spy } from "sinon";
import sinonChai from "sinon-chai";
import { mockRes } from "sinon-express-mock";

import { AuthController } from "../../../src/controllers/auth.controller";
import { createRequestWithBody } from "../../setup/create-request";

use(sinonChai);
use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("auth.controller unit tests", function() {
  const sb = createSandbox();

  const usersRepository: any = {
    getByUsername: () => null,
  };
  const authService: any = {
    authenticateByUsername: () => null,
  };
  const tokenService: any = {
    sign: () => null,
  };

  const createAuthController = () => new AuthController(
    usersRepository,
    authService,
    tokenService,
    null,
  );

  beforeEach(function() {
    sb.restore();
  });

  describe("#actionLogin()", function() {
    it("should pass error object to the next middlweware (missing username)", function() {
      const password = "Password0";
      const req = createRequestWithBody({
        password,
      });
      const res = mockRes();
      const next = spy();
      const authController = createAuthController();

      authController._login(req, res, next);

      return expect(next).to.be.calledWithMatch({
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      });
    });

    it("should not call getByUsername() (missing username)", function() {
      const password = "Password0";
      const req = createRequestWithBody({
        password,
      });
      const res = mockRes();
      const next = spy();
      const authController = createAuthController();
      const getByUsernameSpy = sb.spy(usersRepository, "getByUsername");

      authController._login(req, res, next);

      return expect(getByUsernameSpy).to.not.be.called;
    });

    it("should pass error object to the next middlweware (missing password)", function() {
      const username = "username";
      const req = createRequestWithBody({
        username,
      });
      const res = mockRes();
      const next = spy();
      const authController = createAuthController();

      authController._login(req, res, next);

      return expect(next).to.be.calledWithMatch({
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      });
    });

    it("should not call getByUsername() (missing password)", function() {
      const username = "username";
      const req = createRequestWithBody({
        username,
      });
      const res = mockRes();
      const next = spy();
      const authController = createAuthController();
      const getByUsernameSpy = sb.spy(usersRepository, "getByUsername");

      authController._login(req, res, next);

      return expect(getByUsernameSpy).to.not.be.called;
    });

    it("should call getByUsername() with username (valid request)", function() {
        const username = "username";
        const password = "Password0";
        const req = createRequestWithBody({
          username,
          password,
        });
        const res = mockRes();
        const next = spy();
        const authController = createAuthController();
        const getByUsernameStub = sb.stub(usersRepository, "getByUsername").resolves();

        authController._login(req, res, next);

        return expect(getByUsernameStub).to.be.calledOnceWith(username);
    });
  });
});

import "mocha";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import status from "http-status";
import { createSandbox, spy, stub } from "sinon";
import sinonChai from "sinon-chai";
import { mockReq, mockRes } from "sinon-express-mock";

import { UsersController } from "../../../src/controllers/users.controller";
import { createRequestWithBody } from "../../setup/create-mock-request";

use(sinonChai);
use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("users.controller unit tests", function() {
  const sb = createSandbox();

  const usersRepository: any = {
    save: () => null,
  };

  const createUsersController = () => new UsersController(
    usersRepository,
    null,
  );

  beforeEach(function() {
    sb.restore();
  });

  describe("#_register()", function() {
    it("should pass error object to the next middlweware (missing username)", function() {
      const email = "user@domain.com";
      const password = "Password0";
      const req = createRequestWithBody({
        email,
        password,
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      usersController._register(req, res, next);

      return expect(next).to.be.calledWithMatch({
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      });
    });

    it("should not call save() (missing username)", function() {
      const email = "user@domain.com";
      const password = "Password0";
      const req = createRequestWithBody({
        email,
        password,
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      const saveSpy = sb.spy(usersRepository, "save");

      usersController._register(req, res, next);

      return expect(saveSpy).to.not.be.called;
    });

    it("should pass error object to the next middlweware (missing email)", function() {
      const username = "username";
      const password = "Password0";
      const req = createRequestWithBody({
        username,
        password,
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      usersController._register(req, res, next);

      const internalError = {
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      };

      return expect(next).to.be.calledWithMatch(internalError);
    });

    it("should not call save() (missing email)", function() {
      const username = "username";
      const password = "Password0";
      const req = createRequestWithBody({
        username,
        password,
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      const saveSpy = sb.spy(usersRepository, "save");

      usersController._register(req, res, next);

      return expect(saveSpy).to.not.be.called;
    });

    it("should pass error object to the next middlweware (missing password)", function() {
      const email = "user@domain.com";
      const username = "username";
      const req = createRequestWithBody({
        email,
        username,
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      usersController._register(req, res, next);

      const internalError = {
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      };

      return expect(next).to.be.calledWithMatch(internalError);
    });

    it("should not call save() (missing password)", function() {
      const email = "user@domain.com";
      const username = "username";
      const req = createRequestWithBody({
        email,
        username,
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      const saveSpy = sb.spy(usersRepository, "save");

      usersController._register(req, res, next);

      return expect(saveSpy).to.not.be.called;
    });

    it("should call save() with User object (valid request)", function() {
      const username = "username";
      const email = "user@domain.com";
      const password = "Password0";
      const req = createRequestWithBody({
        username,
        email,
        password,
      });
      const res = mockRes();
      const next = stub();
      const usersController = createUsersController();
      const saveStub = sb.stub(usersRepository, "save").resolves();

      usersController._register(req, res, next);

      return expect(saveStub).to.be.calledWithMatch({
        username,
        email,
      });
    });
  });

  describe("#user()", function() {
    it("should pass error object to the next middlweware (missing id)",
      function() {
        const username = "username";
        const email = "user@domain.com";
        const req = mockReq({
          user: {
            username,
            email,
          },
        });
        const res = mockRes();
        const next = spy();
        const usersController = createUsersController();

        usersController.user(req, res, next);

        const internalError = {
          output: {
            payload: {
              statusCode: status.INTERNAL_SERVER_ERROR,
            },
          },
        };

        return expect(next).to.be.calledWithMatch(internalError);
      });

    it("should pass error object to the next middlweware (missing username)", function() {
      const id  = 1;
      const email = "user@domain.com";
      const req = mockReq({
        user: {
          id,
          email,
        },
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      usersController.user(req, res, next);

      const internalError = {
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      };

      return expect(next).to.be.calledWithMatch(internalError);
    });

    it("should pass error object to the next middlweware (missing email)", function() {
      const id = 1;
      const username = "username";
      const req = mockReq({
        user: {
          id,
          username,
        },
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      usersController.user(req, res, next);

      const internalError = {
        output: {
          payload: {
            statusCode: status.INTERNAL_SERVER_ERROR,
          },
        },
      };

      return expect(next).to.be.calledWithMatch(internalError);
    });

    it("should call res.json() (valid request)", function() {
      const id = 1;
      const username = "username";
      const email = "user@domain.com";
      const req = mockReq({
        user: {
          id,
          username,
          email,
        },
      });
      const res = mockRes();
      const next = spy();
      const usersController = createUsersController();

      usersController.user(req, res, next);

      return expect(res.json).to.be.calledOnceWithExactly({
        id,
        username,
        email,
      });
    });
  });
});

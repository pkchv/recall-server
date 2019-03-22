import 'mocha';

import { expect } from 'chai';

import { Environment } from '../../../src/common/environment';
import { TokenService } from '../../../src/services/token.service';

/* tslint:disable:ter-prefer-arrow-callback */
describe('token.service unit tests', function () {
  describe('#sign()', function () {
    it('should return non-empty token', function () {
      const jwtSecret = 'token-secret';
      const userId = 5;
      const tokenService = new TokenService(new Environment({
        JWT_SECRET: jwtSecret,
      }));

      const token = tokenService.sign(userId);

      return expect(token).to.be.not.of.length(0);
    });

    it('should return two non-equal tokens when signed content is different', function () {
      const jwtSecret = 'token-secret';
      const userId1 = 1;
      const userId2 = 2;
      const tokenService = new TokenService(new Environment({
        JWT_SECRET: jwtSecret,
      }));

      const token1 = tokenService.sign(userId1);
      const token2 = tokenService.sign(userId2);

      return expect(token1).to.be.not.equal(token2);
    });

    it('should return two non-equal tokens when JWT secert is different', function () {
      const jwtSecret1 = 'token-secret1';
      const jwtSecret2 = 'token-secret2';
      const payload = 5;

      const tokenService1 = new TokenService(new Environment({
        JWT_SECRET: jwtSecret1,
      }));

      const tokenService2 = new TokenService(new Environment({
        JWT_SECRET: jwtSecret2,
      }));

      const token1 = tokenService1.sign(payload);
      const token2 = tokenService2.sign(payload);

      return expect(token1).to.be.not.equal(token2);
    });

  });
});

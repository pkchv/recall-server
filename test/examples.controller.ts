import 'mocha';
import { expect } from 'chai';
import { default as request } from 'supertest';
import { App } from '../server/common/server';
import routes from '../server/routes';

const app = (new App())
  .router(routes)
  .listen(3000);

describe('Examples', () => {
  it('should get all examples', () =>
    request(app)
      .get('/api/v1/examples')
      .expect('Content-Type', /json/)
      .then((r) => {
        expect(r.body)
          .to.be.an('array')
          .of.length(2);
      }));

  it('should add a new example', () =>
    request(app)
      .post('/api/v1/examples')
      .send({ name: 'test' })
      .expect('Content-Type', /json/)
      .then((r) => {
        expect(r.body)
          .to.be.an('object')
          .that.has.property('name')
          .equal('test');
      }));

  it('should get an example by id', () =>
    request(app)
      .get('/api/v1/examples/2')
      .expect('Content-Type', /json/)
      .then((r) => {
        expect(r.body)
          .to.be.an('object')
          .that.has.property('name')
          .equal('test');
      }));
});

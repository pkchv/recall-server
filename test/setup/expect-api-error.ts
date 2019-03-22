import { expect } from "chai";
import request from "supertest";

export function expectApiError(app, endpoint, payload, status) {
  return request(app)
    .post(endpoint)
    .send(payload)
    .expect("Content-Type", /json/)
    .expect(status)
    .then((res) => {
      expect(res.body).to.have.property("statusCode", status);
      expect(res.body).to.have.property("error");
      expect(res.body).to.have.property("message");
    });
}

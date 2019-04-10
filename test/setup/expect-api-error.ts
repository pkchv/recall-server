import { expect } from "chai";
import { Application } from "express";
import request from "supertest";

function setAuth(req: request.Test, token: string | undefined) {
  if (token !== undefined) {
    req.set("Authorization", `Bearer ${token}`);
  }
}

function testBody(status: number) {
  return (res) => {
    expect(res.body).to.have.property("statusCode", status);
    expect(res.body).to.have.property("error");
    expect(res.body).to.have.property("message");
  };
}

function testHeaders(req: request.Test, status: number) {
  req
    .expect(status)
    .expect("Content-Type", /json/);
}

// Note: No sane way to set method dynamically in supertest

export function expectErrorGet(app: Application, endpoint: string, status: number, token?: string) {
  const req = request(app).get(endpoint);
  setAuth(req, token);
  testHeaders(req, status);

  return req
    .expect(testBody(status));
}

export function expectErrorPost(app: Application, endpoint: string, payload: object, status: number, token?: string) {
  const req = request(app).post(endpoint);
  setAuth(req, token);
  testHeaders(req, status);

  return req
    .send(payload)
    .expect(testBody(status));
}

export function expectErrorPut(app: Application, endpoint: string, payload: object, status: number, token?: string) {
  const req = request(app).put(endpoint);
  setAuth(req, token);
  testHeaders(req, status);

  return req
    .send(payload)
    .expect(testBody(status));
}

export function expectErrorDelete(app: Application, endpoint: string, status: number, token?: string) {
  const req = request(app).delete(endpoint);
  setAuth(req, token);
  testHeaders(req, status);

  return req
    .expect(testBody(status));
}

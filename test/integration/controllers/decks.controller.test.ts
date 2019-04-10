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
import { DecksController } from "../../../src/controllers/decks.controller";
import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { User } from "../../../src/entities/User";
import { auth } from "../../setup/auth-header";
import { mountConfiguration, mountController, resetContainer, setEnvironment } from "../../setup/container-helpers";
import { expectErrorDelete, expectErrorGet, expectErrorPost, expectErrorPut } from "../../setup/expect-api-error";
import { DecksGenerator } from "../../setup/generators/decks.generator";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("decks.controller integration tests", function() {
  const instanceId = uuid();
  const db = new TestDatabase();
  const env = new Environment({ JWT_SECRET: "jwtsecret" });
  setEnvironment(instanceId, env);
  const genUser = new UsersGenerator(instanceId);
  const genDeck = new DecksGenerator();
  let app = null;

  beforeEach(async function() {
    app = express();
    useContainer(Container);
    await db.createConnection({ entities: [Card, Data, Deck, Metadata, Tag, User] });
    setEnvironment(instanceId, env);
    mountConfiguration(instanceId, app);
    mountController(instanceId, app, DecksController);
  });

  afterEach(async function() {
    await db.close();
    resetContainer(instanceId);
  });

  describe("POST /decks", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const endpoint = `/decks`;
      const payload = genDeck.create("deck1");
      const code = status.UNAUTHORIZED;
      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - Malformed body, invalid data type", async function() {
      const endpoint = `/decks`;
      const payload = {
        name: 0,
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - Malformed body, missing name property", async function() {
      const endpoint = `/decks`;
      const payload = {};
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Conflict (409) - deck name is not unique", async function() {
      const deckName = "deck1";
      const deck = genDeck.create(deckName);
      await genDeck.insert(deck);

      const endpoint = `/decks`;
      const payload = genDeck.create(deckName);
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.CONFLICT;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("OK (200) - creates a deck", async function() {
      const endpoint = `/decks`;
      const payload = genDeck.create("deck1");
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.CREATED;
      return request(app)
        .post(endpoint)
        .send(payload)
        .set(...auth(token))
        .expect(code)
        .expect((res) => expect(res.body).to.be.empty);
    });

  });

  describe("GET /decks", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const endpoint = `/decks`;
      const code = status.UNAUTHORIZED;
      return expectErrorGet(app, endpoint, code);
    });

    it("OK (200) - lists all decks", async function() {
      const deck = await genDeck.insert();
      const endpoint = `/decks`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
        .get(endpoint)
        .set(...auth(token))
        .expect(code)
        .expect((res) => {
          expect(res.body).to.be.lengthOf(1);
          expect(res.body).to.deep.include(deck);
        });
    });

  });

  describe("GET /decks/:deckId", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const code = status.UNAUTHORIZED;
      return expectErrorGet(app, endpoint, code);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorGet(app, endpoint, code, token);
    });

    it("OK (200) - retrieves a single deck", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const endpoint = `/decks/${deckId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
      .get(endpoint)
      .set(...auth(token))
      .expect(code)
      .expect((res) => {
        expect(res.body).to.deep.equal(deck);
      });
    });

  });

  describe("PUT /decks/:deckId", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const payload = genDeck.create("deck1");
      const code = status.UNAUTHORIZED;
      return expectErrorPut(app, endpoint, payload, code);
    });

    it("Bad Request (400) - Malformed body, invalid data type", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const payload = {
        name: 0,
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - Malformed body, missing name property", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const payload = {};
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const payload = genDeck.create("deck1");
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Conflict (409) - deck name is not unique", async function() {
      const deckName = "deck1";
      const deck = genDeck.create(deckName);
      await genDeck.insert(deck);

      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const payload = genDeck.create(deckName);
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.CONFLICT;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("OK (200) - updates a deck", async function() {
      const deckDto = genDeck.create("deck1");
      const deck = await genDeck.insert(deckDto);
      const deckId = deck.id;
      const endpoint = `/decks/${deckId}`;
      const payload = genDeck.create("deck2");
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
        .put(endpoint)
        .send(payload)
        .set(...auth(token))
        .expect(code)
        .expect((res) => expect(res.body).to.be.empty);
    });
  });

  describe("DELETE /decks/:deckId", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const code = status.UNAUTHORIZED;
      return expectErrorDelete(app, endpoint, code);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorDelete(app, endpoint, code, token);
    });

    it("OK (200) - removes a deck", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const endpoint = `/decks/${deckId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
        .delete(endpoint)
        .set(...auth(token))
        .expect(code)
        .expect((res) => expect(res.body).to.be.empty);
    });

  });

});

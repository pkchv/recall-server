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
import { CardsController } from "../../../src/controllers/cards.controller";
import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { User } from "../../../src/entities/User";
import { auth } from "../../setup/auth-header";
import { mountConfiguration, mountController, resetContainer, setEnvironment } from "../../setup/container-helpers";
import { expectErrorDelete, expectErrorGet, expectErrorPost, expectErrorPut } from "../../setup/expect-api-error";
import { CardsGenerator } from "../../setup/generators/cards.generator";
import { DecksGenerator } from "../../setup/generators/decks.generator";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("cards.controller integration tests", function() {
  const instanceId = uuid();
  const db = new TestDatabase();
  const env = new Environment({ JWT_SECRET: "jwtsecret" });
  setEnvironment(instanceId, env);
  const genUser = new UsersGenerator(instanceId);
  const genCard = new CardsGenerator(instanceId);
  const genDeck = new DecksGenerator();
  let app = null;

  beforeEach(async function() {
    app = express();
    useContainer(Container);
    await db.createConnection({ entities: [Card, Data, Deck, Metadata, Tag, User] });
    setEnvironment(instanceId, env);
    mountConfiguration(instanceId, app);
    mountController(instanceId, app, CardsController);
  });

  afterEach(async function() {
    await db.close();
    resetContainer(instanceId);
  });

  describe("POST /decks/:deckId/cards/add", function() {
    it("Unauthorized (401) - authentication header is missing", function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = genCard.create();
      const code = status.UNAUTHORIZED;
      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - malformed body, missing card data property", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = {
        card: {
          data: {
            front: "front",
          },
          type: 1,
        },
        tags: ["foo"],
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - malformed body, missing card data", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = {
        card: {
          data: {},
          type: 1,
        },
        tags: ["foo"],
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - malformed body, missing tags property", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = {
        card: {
          data: {
            front: "front",
            back: "back",
          },
          type: 1,
        }
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - malformed body, invalid card data type id", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = {
        card: {
          data: {
            front: "foo",
          },
          type: 3,
        },
        tags: ["foo"],
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = genCard.create();
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Created (201) - accepts a valid request", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const endpoint = `/decks/${deckId}/cards/add`;
      const payload = genCard.create();
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

  describe("GET /decks/:deckId/cards", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards`;
      const code = status.UNAUTHORIZED;
      return expectErrorGet(app, endpoint, code);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/cards`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorGet(app, endpoint, code, token);
    });

    it("OK (200) - lists cards in a deck", async function() {
      const deck = await genDeck.insert();
      const card = await genCard.insert(deck.id);
      const cardJSON = await card.toJSON();
      const deckId = deck.id;
      const endpoint = `/decks/${deckId}/cards`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
        .get(endpoint)
        .set(...auth(token))
        .expect(code)
        .expect((res) => {
          expect(res.body).to.be.lengthOf(1);
          expect(res.body).to.deep.include(cardJSON);
        });
    });
  });

  describe("GET /decks/:deckId/cards/:cardId", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const code = status.UNAUTHORIZED;
      return expectErrorGet(app, endpoint, code);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorGet(app, endpoint, code, token);
    });

    it("Not Found (404) - card does not exist", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorGet(app, endpoint, code, token);
    });

    it("OK (200) - retrieves a single card", async function() {
      const deck = await genDeck.insert();
      const card = await genCard.insert(deck.id);
      const cardJSON = await card.toJSON();
      const deckId = deck.id;
      const cardId = card.id;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
        .get(endpoint)
        .set(...auth(token))
        .expect(code)
        .expect((res) => expect(res.body).to.deep.equal(cardJSON));
    });
  });

  describe("PUT /decks/:deckId/cards/:cardId", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = genCard.create();
      const code = status.UNAUTHORIZED;
      return expectErrorPut(app, endpoint, payload, code);
    });

    it("Bad Request (400) - malformed body, missing card data property", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = {
        card: {
          data: {
            front: "front",
          },
          type: 1,
        },
        tags: ["foo"],
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - malformed body, missing card data", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = {
        card: {
          data: {},
          type: 1,
        },
        tags: ["foo"],
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - malformed body, missing tags property", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = {
        card: {
          data: {
            front: "front",
            back: "back",
          },
          type: 1,
        }
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - malformed body, invalid card data type id", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = {
        card: {
          data: {
            front: "foo",
          },
          type: 3,
        },
        tags: ["foo"],
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = genCard.create();
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("Not Found (404) - card does not exist", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = genCard.create();
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorPut(app, endpoint, payload, code, token);
    });

    it("OK (200) - updates a card", async function() {
      const deck = await genDeck.insert();
      const card = await genCard.insert(deck.id);
      const deckId = deck.id;
      const cardId = card.id;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const payload = genCard.create(["tag1", "tag2"]);
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

  describe("DELETE /decks/:deckId/cards/:cardId", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const code = status.UNAUTHORIZED;
      return expectErrorDelete(app, endpoint, code);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorDelete(app, endpoint, code, token);
    });

    it("Not Found (404) - card does not exist", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorDelete(app, endpoint, code, token);
    });

    it("OK (200) - removes a card", async function() {
      const deck = await genDeck.insert();
      const card = await genCard.insert(deck.id);
      const deckId = deck.id;
      const cardId = card.id;
      const endpoint = `/decks/${deckId}/cards/${cardId}`;
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

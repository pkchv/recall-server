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
import { ReviewsController } from "../../../src/controllers/reviews.controller";
import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { User } from "../../../src/entities/User";
import { auth } from "../../setup/auth-header";
import { mountConfiguration, mountController, resetContainer, setEnvironment } from "../../setup/container-helpers";
import { expectErrorGet, expectErrorPost } from "../../setup/expect-api-error";
import { CardsGenerator } from "../../setup/generators/cards.generator";
import { DecksGenerator } from "../../setup/generators/decks.generator";
import { UsersGenerator } from "../../setup/generators/users.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("reviews.controller integration tests", function() {
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
    mountController(instanceId, app, ReviewsController);
  });

  afterEach(async function() {
    await db.close();
    resetContainer(instanceId);
  });

  describe("POST /decks/:deckId/cards/:cardId/schedule", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: 1.0,
      };
      const code = status.UNAUTHORIZED;
      return expectErrorPost(app, endpoint, payload, code);
    });

    it("Bad Request (400) - performance out of range", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: 2.0,
      };

      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - Malformed body, performance out of range", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: -1.0,
      };

      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - Malformed body, invalid data type", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: "1.0",
      };

      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Bad Request (400) - Malformed body, performance property is missing", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {};
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.BAD_REQUEST;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: 1.0,
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("Not Found (404) - card does not exist", async function() {
      const deck = await genDeck.insert();
      const deckId = deck.id;
      const cardId = 1;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: 1.0,
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorPost(app, endpoint, payload, code, token);
    });

    it("OK (200) - accepts performance", async function() {
      const deck = await genDeck.insert();
      const card = await genCard.insert(deck.id);
      const deckId = deck.id;
      const cardId = card.id;
      const endpoint = `/decks/${deckId}/cards/${cardId}/schedule`;
      const payload = {
        performance: 1.0,
      };
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.OK;
      return request(app)
        .post(endpoint)
        .send(payload)
        .set(...auth(token))
        .expect(code)
        .expect((res) => expect(res.body).to.be.empty);
    });

  });

  describe("GET /decks/:deckId/review", function() {
    it("Unauthorized (403) - authentication header is missing", function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/review`;
      const code = status.UNAUTHORIZED;
      return expectErrorGet(app, endpoint, code);
    });

    it("Not Found (404) - deck does not exist", async function() {
      const deckId = 1;
      const endpoint = `/decks/${deckId}/review`;
      const user = await genUser.insert();
      const token = genUser.getToken(user);
      const code = status.NOT_FOUND;
      return expectErrorGet(app, endpoint, code, token);
    });

    it("OK (200) - retrieves cards to review", async function() {
      const deck = await genDeck.insert();
      const card = await genCard.insert(deck.id);
      const cardJSON = await card.toJSON();
      const deckId = deck.id;
      const endpoint = `/decks/${deckId}/review`;
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

});

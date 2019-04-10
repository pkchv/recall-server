import "mocha";
import "reflect-metadata";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Container } from "typedi";
import { useContainer } from "typeorm";
import uuid from "uuid/v1";

import { Environment } from "../../../src/common/environment";
import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { ICardDto } from "../../../src/interfaces/dto/ICardDto";
import { CardsService } from "../../../src/services/cards.service";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("cards.service integration tests", function() {
  const db = new TestDatabase();
  const containerId = uuid();
  let connection = null;
  let cardsService = null;

  beforeEach(async function() {
    useContainer(Container);
    Container.of(containerId).set("environment", new Environment({
      DB_USER_SCHEMA_PREFIX: "user_",
    }));
    connection = await db.createConnection({ entities: [Card, Tag, Data, Deck, Metadata] });
    cardsService = Container.of(containerId).get(CardsService);
  });

  afterEach(async function() {
    await db.close();
    Container.reset(containerId);
  });

  describe("#save()", function() {
    it("should return undefined when deck does not exist", async function() {
      const userId = -1;
      const deckId = 1;
      const partialCard: ICardDto = {
        card: {
          type: 0,
          data: {
            front: "front",
            back: "back",
          },
        },
        tags: ["tag1", "tag2", "tag3"],
      };

      const card = await cardsService.save(userId, deckId, partialCard);

      return expect(card).to.be.undefined;
    });

    it("should return a card when deck does exist", async function() {
      const userId = 1;
      const deckId = 1;
      const partialCard: ICardDto = {
        card: {
          type: 0,
          data: {
            front: "front",
            back: "back",
          },
        },
        tags: ["tag1", "tag2", "tag3"],
      };
      const deck = new Deck();
      deck.name = "deck";
      const deckRepository = connection.getRepository(Deck);
      await deckRepository.save(deck);

      const card = await cardsService.save(userId, deckId, partialCard);

      return expect(card).to.not.be.undefined;
    });

    it("should save cards tags", async function() {
      const userId = 1;
      const deckId = 1;
      const partialCard: ICardDto = {
        card: {
          type: 0,
          data: {
            front: "front",
            back: "back",
          },
        },
        tags: ["tag1", "tag2", "tag3"],
      };
      const deck = new Deck();
      deck.name = "deck";
      const deckRepository = connection.getRepository(Deck);
      await deckRepository.save(deck);

      const card = await cardsService.save(userId, deckId, partialCard);

      return expect(await card.tags).to.be.of.length(3);
    });

    it("should save cards data", async function() {
      const userId = 1;
      const deckId = 1;
      const partialCard: ICardDto = {
        card: {
          type: 0,
          data: {
            front: "front",
            back: "back",
          },
        },
        tags: ["tag1", "tag2", "tag3"],
      };
      const deck = new Deck();
      deck.name = "deck";
      const deckRepository = connection.getRepository(Deck);
      await deckRepository.save(deck);

      const card = await cardsService.save(userId, deckId, partialCard);
      const cardData = await card.data;

      return expect(cardData.object).to.include(partialCard.card.data);
    });

    it("should save cards metadata", async function() {
      const userId = 1;
      const deckId = 1;
      const partialCard: ICardDto = {
        card: {
          type: 0,
          data: {
            front: "front",
            back: "back",
          },
        },
        tags: ["tag1", "tag2", "tag3"],
      };
      const deck = new Deck();
      deck.name = "deck";
      const deckRepository = connection.getRepository(Deck);
      await deckRepository.save(deck);

      const card = await cardsService.save(userId, deckId, partialCard);

      return expect(await card.metadata).to.not.be.undefined;
    });

    it("should remove duplicated and invalid tags", async function() {
      const userId = 1;
      const deckId = 1;
      const partialCard: ICardDto = {
        card: {
          type: 0,
          data: {
            front: "front",
            back: "back",
          },
        },
        tags: ["tag1", "tag1"],
      };

      const deck = new Deck();
      deck.name = "deck";
      const deckRepository = connection.getRepository(Deck);
      await deckRepository.save(deck);

      const card = await cardsService.save(userId, deckId, partialCard);

      return expect(await card.tags).to.be.lengthOf(1);
    });

  });
});

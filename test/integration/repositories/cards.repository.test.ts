import "mocha";
import "reflect-metadata";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Container } from "typedi";
import { useContainer } from "typeorm";
import uuid from "uuid/v1";

import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { CardsRepository } from "../../../src/repositories/cards.repository";
import { CardsGenerator } from "../../setup/generators/cards.generator";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("cards.repository integration tests", function() {
  const db = new TestDatabase();
  let connection = null;
  const instanceId = uuid();
  const cardsGenerator = new CardsGenerator(instanceId);
  let deckRepository = null;
  let cardsRepository = null;

  beforeEach(async function() {
    useContainer(Container);
    connection = await db.createConnection({ entities: [Card, Tag, Data, Deck, Metadata] });
    deckRepository = connection.getRepository(Deck);
    cardsRepository = connection.getCustomRepository(CardsRepository);
  });

  afterEach(async function() {
    await db.close();
  });

  describe("#getByTag()", function() {
    it("should not find any cards", async function() {
      const cards = await cardsRepository.getByTag(1);
      return expect(cards).to.be.length(0);
    });

    it("should find one card from one deck", async function() {
      const tagId = 1;
      const tag = "tag1";
      const deck = new Deck("deck");
      const savedDeck = await deckRepository.save(deck);
      const cardDto = cardsGenerator.create([tag]);
      await cardsGenerator.insert(savedDeck.id, cardDto);

      const cards = await cardsRepository.getByTag(tagId);

      return expect(cards).to.be.length(1);
    });

    it("should find two cards from one deck", async function() {
      const tagId = 1;
      const tag = "tag1";
      const deck = new Deck("deck");
      const savedDeck = await deckRepository.save(deck);
      const cardDto1 = cardsGenerator.create([tag]);
      const cardDto2 = cardsGenerator.create([tag]);
      await cardsGenerator.insert(savedDeck.id, cardDto1);
      await cardsGenerator.insert(savedDeck.id, cardDto2);

      const cards = await cardsRepository.getByTag(tagId);

      return expect(cards).to.be.length(2);
    });

    it("should find two cards from two decks", async function() {
      const tagId = 1;
      const tag = "tag1";
      const deck1 = new Deck("deck1");
      const deck2 = new Deck("deck2");
      const savedDeck1 = await deckRepository.save(deck1);
      const savedDeck2 = await deckRepository.save(deck2);
      const cardDto1 = cardsGenerator.create([tag]);
      const cardDto2 = cardsGenerator.create([tag]);
      await cardsGenerator.insert(savedDeck1.id, cardDto1);
      await cardsGenerator.insert(savedDeck2.id, cardDto2);

      const cards = await cardsRepository.getByTag(tagId);

      return expect(cards).to.be.length(2);
    });

    it("should find one card from one deck", async function() {
      const tagId = 1;
      const tag = "tag1";
      const deck1 = new Deck("deck1");
      const deck2 = new Deck("deck2");
      const savedDeck1 = await deckRepository.save(deck1);
      const savedDeck2 = await deckRepository.save(deck2);
      const cardDto1 = cardsGenerator.create([tag]);
      const cardDto2 = cardsGenerator.create([tag]);
      await cardsGenerator.insert(savedDeck1.id, cardDto1);
      await cardsGenerator.insert(savedDeck2.id, cardDto2);

      const cards = await cardsRepository.getByTag(tagId, savedDeck1.id);

      return expect(cards).to.be.length(1);
    });
  });

  describe("#getByDeck()", function() {
    it("should not find any cards", async function() {
      const deck = new Deck("deck2");
      const savedDeck = await deckRepository.save(deck);
      const cards = await cardsRepository.getByDeck(savedDeck.id);
      return expect(cards).to.be.length(0);
    });

    it("should find one card from one deck", async function() {
      const deck = new Deck("deck");
      const savedDeck = await deckRepository.save(deck);
      const cardDto = cardsGenerator.create();
      await cardsGenerator.insert(savedDeck.id, cardDto);

      const cards = await cardsRepository.getByDeck(savedDeck.id);

      return expect(cards).to.be.length(1);
    });

    it("should find one card from one deck", async function() {
      const deck1 = new Deck("deck1");
      const deck2 = new Deck("deck2");
      const savedDeck1 = await deckRepository.save(deck1);
      const savedDeck2 = await deckRepository.save(deck2);
      const cardDto1 = cardsGenerator.create();
      const cardDto2 = cardsGenerator.create();
      await cardsGenerator.insert(savedDeck1.id, cardDto1);
      await cardsGenerator.insert(savedDeck2.id, cardDto2);

      const cards = await cardsRepository.getByDeck(savedDeck1.id);

      return expect(cards).to.be.length(1);
    });
  });

  describe("#exists()", function() {
    it("should be false (no card with id in deck)", async function() {
      const deck = new Deck("deck");
      const savedDeck = await deckRepository.save(deck);
      const deckId = savedDeck.id;
      const cardId = 1;
      const exists = await cardsRepository.exists(deckId, cardId);
      return expect(exists).to.be.false;
    });

    it("should be false (no card with id and type in deck)", async function() {
      const deck = new Deck("deck");
      const savedDeck = await deckRepository.save(deck);
      const deckId = savedDeck.id;
      const cardDto = cardsGenerator.create();
      const card = await cardsGenerator.insert(deckId, cardDto);
      const cardId = card.id;
      const { type } = await card.data;
      const exists = await cardsRepository.exists(deckId, cardId, type + 1);
      return expect(exists).to.be.false;
    });

    it("should be true (card with id exists)", async function() {
      const deck = new Deck("deck2");
      const savedDeck = await deckRepository.save(deck);
      const deckId = savedDeck.id;
      const cardDto = cardsGenerator.create();
      const card = await cardsGenerator.insert(deckId, cardDto);
      const cardId = card.id;

      const exists = await cardsRepository.exists(deckId, cardId);

      return expect(exists).to.be.true;
    });

    it("should be true (card with id and type exists)", async function() {
      const deck = new Deck("deck2");
      const savedDeck = await deckRepository.save(deck);
      const deckId = savedDeck.id;
      const cardDto = cardsGenerator.create();
      const card = await cardsGenerator.insert(deckId, cardDto);
      const cardId = card.id;
      const { type } = await card.data;

      const exists = await cardsRepository.exists(deckId, cardId, type);

      return expect(exists).to.be.true;
    });
  });

});

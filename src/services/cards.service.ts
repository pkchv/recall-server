import { Inject, Service } from "typedi";

import { Card } from "../entities/Card";
import { Data } from "../entities/Data";
import { Deck } from "../entities/Deck";
import { Metadata } from "../entities/Metadata";
import { Tag } from "../entities/Tag";
import { ICardDto } from "../interfaces/dto/ICardDto";
import { CardsRepository } from "../repositories/cards.repository";
import { TagsRepository } from "../repositories/tags.repository";
import { SchemaProviderService } from "./schema-provider.service";

// Note:
// userId uniquely identifies a database schema (card related entities are kept in per user schemas)
// cardId uniquely identifies a card and its relationships
// deckId adds a layer of validation to clients requests

@Service("cards.service")
export class CardsService {
  constructor(
    @Inject("schema-provider.service") private readonly schema: SchemaProviderService,
  ) {}

  public async get(userId: number, deckId: number, cardId: number): Promise<Card | undefined> {
    const connection = await this.schema.getConnection(userId);
    const cardsRepository = connection.getCustomRepository(CardsRepository);

    const card = await cardsRepository.findOne(cardId);

    if (card === undefined) {
      return undefined;
    }

    const deck = await card.deck;

    if (deck.id !== deckId) {
      return undefined;
    }

    return card;
  }

  public async save(userId: number, deckId: number, cardDto: ICardDto): Promise<Card | undefined> {
    const connection = await this.schema.getConnection(userId);
    const cardsRepository = connection.getRepository(Card);
    const decksRepository = connection.getRepository(Deck);
    const dataRepository = connection.getRepository(Data);
    const metaRepository = connection.getRepository(Metadata);

    const card = new Card();

    const deck = await decksRepository.findOne(deckId);

    if (deck === undefined) {
      return undefined;
    }

    card.deck = Promise.resolve(deck);

    const tags = await this.parseTags(userId, cardDto.tags);
    card.setTags(tags);

    const data = Data.create(cardDto.card);
    await dataRepository.save(data);
    card.data = Promise.resolve(data);

    const metadata = Metadata.init();
    await metaRepository.save(metadata);
    card.metadata = Promise.resolve(metadata);

    return cardsRepository.save(card);
  }

  public async update(userId: number,
                      deckId: number,
                      cardId: number,
                      cardDto: ICardDto): Promise<Card | undefined> {
    const connection = await this.schema.getConnection(userId);
    const cardsRepository = connection.getCustomRepository(CardsRepository);

    const card = await cardsRepository.findOne(cardId);

    if (card === undefined) {
      return undefined;
    }

    const deck = await card.deck;

    if (deck.id !== deckId) {
      return undefined;
    }

    const tags = await this.parseTags(userId, cardDto.tags);
    card.setTags(tags);

    const data = Data.create(cardDto.card);
    const { id } = await card.data;
    data.id = id;
    card.setData(data);

    return cardsRepository.save(card);
  }

  public async remove(userId: number, deckId: number, cardId: number): Promise<Card | undefined> {
    // TODO: accountants don't use erasers, add archived property

    const connection = await this.schema.getConnection(userId);
    const cardsRepository = connection.getRepository(Card);

    const card = await cardsRepository.findOne({
      relations: ["deck"],
      where: {
        deck: {
          id: deckId,
        },
        id: cardId,
      },
    });

    if (card === undefined) {
      return undefined;
    }

    return cardsRepository.remove(card);
  }

  public async findByDeck(userId: number, deckId: number): Promise<Card[]> {
    const connection = await this.schema.getConnection(userId);

    return connection
      .getCustomRepository(CardsRepository)
      .getByDeck(deckId);
  }

  private async parseTags(userId: number, tagNames: string[]): Promise<Tag[]> {
    const connection = await this.schema.getConnection(userId);
    const tagsRepository = connection.getCustomRepository(TagsRepository);

    const tags = Tag.fromArray(tagNames);
    return Promise.all(tags.map(async (tag) => await tagsRepository.findOrSave(tag)));
  }
}

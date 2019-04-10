import { Inject, Service } from "typedi";

import { Deck } from "../entities/Deck";
import { IDeckDto } from "../interfaces/dto/IDeckDto";
import { DecksRepository } from "../repositories/decks.repository";
import { SchemaProviderService } from "./schema-provider.service";

@Service("decks.service")
export class DecksService {
  constructor(
    @Inject("schema-provider.service") private readonly schema: SchemaProviderService,
  ) {}

  public async get(userId: number, deckId: number) {
    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getRepository(Deck);

    return decksRepository.findOne(deckId);
  }

  public async getAll(userId: number) {
    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getRepository(Deck);

    return decksRepository.find();
  }

  public async save(userId: number, deckDto: IDeckDto) {
    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getCustomRepository(DecksRepository);

    const isUnique = await decksRepository.isNameUnique(deckDto.name);

    if (!isUnique) {
      return undefined;
    }

    const deck = new Deck(deckDto.name);
    return decksRepository.save(deck);
  }

  public async update(userId: number, deckId: number, deckDto: IDeckDto) {
    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getCustomRepository(DecksRepository);

    const deck = await decksRepository.findOne(deckId);

    if (deck === undefined) {
      return undefined;
    }

    const isUnique = await decksRepository.isNameUnique(deckDto.name);

    if (!isUnique) {
      return undefined;
    }

    deck.name = deckDto.name;

    return null;
  }

  public async remove(userId: number, deckId: number) {
    // TODO: don't use erasers, add archived property
    // TODO: cascade removes to card related entities

    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getRepository(Deck);

    const deck = await decksRepository.findOne(deckId);

    if (deck === undefined) {
      return undefined;
    }

    return decksRepository.remove(deck);
  }

  public async isNameUnique(userId: number, name: string) {
    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getCustomRepository(DecksRepository);
    return decksRepository.isNameUnique(name);
  }

  public async exists(userId: number, deckId: number): Promise<boolean> {
    const connection = await this.schema.getConnection(userId);
    const decksRepository = connection.getCustomRepository(DecksRepository);
    return decksRepository.exists(deckId);
  }

}

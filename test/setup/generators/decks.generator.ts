import { getRepository } from "typeorm";

import { Deck } from "../../../src/entities/Deck";
import { IDeckDto } from "../../../src/interfaces/dto/IDeckDto";

export class DecksGenerator {

  public create(name: string = "Deck"): IDeckDto {
    return {
      name,
    };
  }

  public async insert(data?: IDeckDto): Promise<Deck> {
    if (data === undefined) {
      data = this.create();
    }

    const deck = new Deck(data.name);
    return getRepository(Deck).save(deck);
  }

}

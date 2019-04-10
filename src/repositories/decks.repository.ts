import { EntityRepository, Repository } from "typeorm";

import { Deck } from "../entities/Deck";

@EntityRepository(Deck)
export class DecksRepository extends Repository<Deck> {

  public async isNameUnique(name: string): Promise<boolean> {
    const deck = await this.findOne({
      where: {
        name,
      },
    });

    return deck === undefined;
  }

  public async exists(deckId: number): Promise<boolean> {
    const deck = await this.findOne(deckId);
    return deck !== undefined;
  }

}

import { EntityRepository, Repository } from "typeorm";

import { CardType } from "../card-data/CardType";
import { Card } from "../entities/Card";

@EntityRepository(Card)
export class CardsRepository extends Repository<Card> {

  public getByTag(tagId: number, deckId?: number): Promise<Card[]> {

    if (deckId !== undefined) {
      return this.getByTagAndDeck(tagId, deckId);
    }

    return this.find({
      relations: ["deck", "data", "metadata", "tags"],
      where: {
        tag: {
          id: tagId,
        },
      },
    });
  }

  public getByDeck(deckId: number): Promise<Card[]> {
    return this.find({
      relations: ["deck", "data", "metadata", "tags"],
      where: {
        deck: {
          id: deckId,
        },
      },
    });
  }

  public async exists(deckId: number, cardId: number, dataType?: CardType): Promise<boolean> {
    const card = await this.findOne(cardId);

    if (card === undefined) {
      return false;
    }

    const deck = await card.deck;
    const idMatch = card.id === cardId && deck.id === deckId;

    if (dataType === undefined) {
      return idMatch;
    }

    const data = await card.data;
    return idMatch && data.type === dataType;
  }

  private getByTagAndDeck(tagId: number, deckId: number): Promise<Card[]> {
    return this.find({
      relations: ["deck", "data", "metadata", "tags"],
      where: {
        deck: {
          id: deckId,
        },
        tag: {
          id: tagId,
        },
      },
    });
  }

}

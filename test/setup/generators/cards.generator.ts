import { Container } from "typedi";

import { TCardDataInput } from "../../../src/card-data/TCardDataInput";
import { Card } from "../../../src/entities/Card";
import { ICardDto } from "../../../src/interfaces/dto/ICardDto";
import { CardsService } from "../../../src/services/cards.service";

export class CardsGenerator {

  constructor(private readonly instanceId: number) {}

  public create(tags?: string[], cardData?: TCardDataInput): ICardDto {
     const cardDto: ICardDto = {
      card: {
        data: {
          back: "back",
          front: "front",
        },
        type: 1,
      },
      tags: [],
    };

     if (tags !== undefined) {
      cardDto.tags = tags;
    }

     if (cardData !== undefined) {
      cardDto.card = cardData;
    }

     return cardDto;
  }

  public async insert(deckId: number, data?: ICardDto): Promise<Card> {
    // test database does not use per user schema
    if (data === undefined) {
      data = this.create();
    }

    const userId = 1;
    const cardsService = Container.of(this.instanceId).get(CardsService);
    const card = await cardsService.save(userId, deckId, data);
    return card;
  }

}

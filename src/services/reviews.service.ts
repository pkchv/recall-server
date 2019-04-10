import moment, { Moment } from "moment";
import { Inject, Service } from "typedi";

import { Card } from "../entities/Card";
import { Metadata } from "../entities/Metadata";
import { SchedulerService } from "./scheduler.service";
import { SchemaProviderService } from "./schema-provider.service";

@Service("review.service")
export class ReviewsService {

  constructor(
    @Inject("schema-provider.service") private readonly schema: SchemaProviderService,
    @Inject("scheduler.service") private readonly scheduler: SchedulerService,
  ) {}

  public async schedule(userId: number,
                        deckId: number,
                        cardId: number,
                        performance: number,
                        now: Moment = moment()): Promise<Metadata | undefined> {
    const connection = await this.schema.getConnection(userId);
    const cardRepository = connection.getRepository(Card);
    const metadataRepository = connection.getRepository(Metadata);
    const card = await cardRepository.findOne({
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

    const previous = await card.metadata;
    const next = this.scheduler.schedule(previous, performance, now);

    return metadataRepository.save(next);
  }

  public async fetchReviewSession(userId: number,
                                  deckId: number,
                                  take: number = 10,
                                  now: Moment = moment()): Promise<Card[] | undefined> {
    const connection = await this.schema.getConnection(userId);
    const sessionTimestamp = now.clone().add(1, "day").milliseconds();

    return connection
      .getRepository(Card)
      .createQueryBuilder("card")
      .leftJoin("card.deck", "deck", "deck.id = :deckId", { deckId })
      .leftJoinAndSelect("card.metadata", "metadata", "metadata.nextReview <= :ts", { ts: sessionTimestamp })
      .orderBy("metadata.nextReview", "DESC")
      .take(take)
      .getMany();
  }
}

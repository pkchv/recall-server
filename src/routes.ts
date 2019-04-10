import { Container } from "typedi";

import { AuthController } from "./controllers/auth.controller";
import { CardsController } from "./controllers/cards.controller";
import { DecksController } from "./controllers/decks.controller";
import { ReviewsController } from "./controllers/reviews.controller";
import { UsersController } from "./controllers/users.controller";
import { IController } from "./interfaces/core/IController";

export function createRoutes(instanceId?: string): IController[] {
  const users = Container.of(instanceId).get(UsersController);
  const auth = Container.of(instanceId).get(AuthController);
  const cards = Container.of(instanceId).get(CardsController);
  const decks = Container.of(instanceId).get(DecksController);
  const reviews = Container.of(instanceId).get(ReviewsController);
  return [users, auth, cards, decks, reviews];
}

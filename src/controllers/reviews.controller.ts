import boom from "boom";
import { NextFunction, Request, Response } from "express";
import { body } from "express-validator/check";
import status from "http-status";
import { controller, get, post } from "route-decorators";
import { Service } from "typedi";

import { authenticate } from "../middlewares/authenticate";
import { catchInternal } from "../middlewares/error";
import { validate } from "../middlewares/validate";
import { DecksService } from "../services/decks.service";
import { ReviewsService } from "../services/reviews.service";
import { propAsInt } from "../utility/prop-as-int";
import { isId, isPerformance } from "../validators/simple.validators";
import { Controller } from "./base.controller";

@Service("reviews.controller")
@controller(authenticate)
export class ReviewsController extends Controller {

  constructor(
    @Service("reviews.service") private readonly reviewsService: ReviewsService,
    @Service("decks.service") private readonly decksService: DecksService,
  ) {
    super();
  }

  @post("/decks/:deckId/cards/:cardId/schedule",
        isId("deckId"),
        validate(boom.badRequest("Deck id must be an integer")),
        isId("cardId"),
        validate(boom.badRequest("Card id must be an integer")),
        body("performance").custom(isPerformance),
        validate(boom.badRequest("Performance value must be a numeric value between 0 and 1")))
  public schedule(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");
    const cardId = propAsInt(req.params, "cardId");
    const payload = req.body;

    this.reviewsService.schedule(userId, deckId, cardId, payload.performance)
      .then((metadata) => {

        if (metadata === undefined) {
          return next(boom.notFound("Card does not exist"));
        }

        res.status(status.OK).end();

      })
      .catch((error) => catchInternal(next, error));
  }

  @get("/decks/:deckId/review",
      isId("deckId"),
      validate(boom.badRequest("Deck id must be an integer")))
  public fetchReviewSessionByDeck(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");

    this.decksService.exists(userId, deckId)
      .then((deckExists) => {

        if (!deckExists) {
          return next(boom.notFound());
        }

        return this.reviewsService.fetchReviewSession(userId, deckId)
          .then((cards) => Promise.all(cards.map((card) => card.toJSON())))
          .then((payload) => {
            res.json(payload);
          });

    })
    .catch((error) => catchInternal(next, error));
  }

}

import boom from "boom";
import { NextFunction, Request, Response } from "express";
import { body } from "express-validator/check";
import status from "http-status";
import { controller, del, get, post, put } from "route-decorators";
import { Service } from "typedi";

import { isCardDataObject } from "../card-data/validator";
import { authenticate } from "../middlewares/authenticate";
import { catchInternal } from "../middlewares/error";
import { validate } from "../middlewares/validate";
import { CardsService } from "../services/cards.service";
import { DecksService } from "../services/decks.service";
import { propAsInt } from "../utility/prop-as-int";
import { isId, isTagArray } from "../validators/simple.validators";
import { Controller } from "./base.controller";

@Service("cards.controller")
@controller("/decks/:deckId/cards",
            authenticate,
            isId("deckId"),
            validate(boom.badRequest("Deck id must be an integer")))
export class CardsController extends Controller {

  constructor(
    @Service("cards.service") private readonly cardsService: CardsService,
    @Service("decks.service") private readonly decksService: DecksService,
  ) {
    super();
  }

  @post("/add",
        body("card").custom(isCardDataObject),
        body("tags").custom(isTagArray),
        validate(boom.badRequest("Malformed body payload")))
  public insert(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");
    const payload = req.body;

    this.cardsService.save(userId, deckId, payload)
      .then((card) => {

        if (card === undefined) {
          return next(boom.notFound("Deck with specified id does not exist"));
        }

        res.status(status.CREATED).end();

      })
      .catch((error) => catchInternal(next, error));
  }

  @get("/")
  public findAll(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");

    this.decksService.exists(userId, deckId)
      .then((deckExists) => {

        if (!deckExists) {
          return next(boom.notFound());
        }

        return this.cardsService.findByDeck(userId, deckId)
          .then((cards) => Promise.all(cards.map((card) => card.toJSON())))
          .then((payload) => {
            res.json(payload);
          });
      })
      .catch((error) => catchInternal(next, error));
  }

  @get("/:cardId",
      isId("cardId"),
      validate(boom.badRequest("Card id must be an integer")))
  public find(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");
    const cardId = propAsInt(req.params, "cardId");

    this.cardsService.get(userId, deckId, cardId)
      .then((card) => {

        if (card === undefined) {
          return next(boom.notFound());
        }

        return card.toJSON()
          .then((payload) => {
            res.json(payload);
          });
      })
      .catch((error) => catchInternal(next, error));

  }

  @put("/:cardId",
      isId("cardId"),
      validate(boom.badRequest("Card id must be an integer")),
      body("card").custom(isCardDataObject),
      body("tags").custom(isTagArray),
      validate(boom.badRequest("Malformed body payload")))
  public update(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");
    const cardId = propAsInt(req.params, "cardId");
    const payload = req.body;

    this.cardsService.update(userId, deckId, cardId, payload)
      .then((card) => {

        if (card === undefined) {
          return next(boom.notFound());
        }

        res.status(status.OK).end();

      })
      .catch((error) => catchInternal(next, error));
  }

  @del("/:cardId",
      isId("cardId"),
      validate(boom.badRequest("Card id must be an integer")))
  public remove(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");
    const cardId = propAsInt(req.params, "cardId");

    this.cardsService.remove(userId, deckId, cardId)
      .then((card) => {

        if (card === undefined) {
          return next(boom.notFound());
        }

        res.status(status.OK).end();

      })
      .catch((error) => catchInternal(next, error));
  }

}

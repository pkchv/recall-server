import boom from "boom";
import { NextFunction, Request, Response } from "express";
import { body } from "express-validator/check";
import status from "http-status";
import { controller, del, get, post, put } from "route-decorators";
import { Service } from "typedi";

import { authenticate } from "../middlewares/authenticate";
import { catchInternal } from "../middlewares/error";
import { validate } from "../middlewares/validate";
import { DecksService } from "../services/decks.service";
import { propAsInt } from "../utility/prop-as-int";
import { isId } from "../validators/simple.validators";
import { Controller } from "./base.controller";

@Service("decks.controller")
@controller("/decks", authenticate)
export class DecksController extends Controller {

  constructor(
    @Service("decks.service") private readonly decksService: DecksService,
  ) {
    super();
  }

  @post("/",
        body("name").isString(),
        validate(boom.badRequest("Malformed body payload")),
        body("name").exists().isString(),
        validate(boom.badRequest("Name property is missing from request body")))
  public insert(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const payload = req.body;

    this.decksService.save(userId, payload)
      .then((deck) => {

        if (deck === undefined) {
          return next(boom.conflict("Deck name must be unique"));
        }

        res.status(status.CREATED).end();

      })
      .catch((error) => catchInternal(next, error));
  }

  @get("/")
  public findAll(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;

    this.decksService.getAll(userId)
      .then((decks) => res.json(decks))
      .catch((error) => catchInternal(next, error));
  }

  @get("/:deckId",
      isId("deckId"),
      validate(boom.badRequest("Deck id must be an integer")))
  public find(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");

    this.decksService.get(userId, deckId)
      .then((deck) => {

        if (deck === undefined) {
          return next(boom.notFound("Deck does not exist"));
        }

        res.json(deck);

      })
      .catch((error) => catchInternal(next, error));
  }

  @put("/:deckId",
      isId("deckId"),
      validate(boom.badRequest("Deck id must be an integer")),
      body("name").exists().isString(),
      validate(boom.badRequest("Name property is missing from request body")))
  public update(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");
    const payload = req.body;

    this.decksService.isNameUnique(userId, payload.name)
      .then((isUnique) => {

        if (!isUnique) {
          return next(boom.conflict("Deck with specified name is alread in use"));
        }

        return this.decksService.update(userId, deckId, payload)
          .then((deck) => {

            if (deck === undefined) {
              return next(boom.notFound("Deck does not exist"));
            }

            res.status(status.OK).end();

          });
      })
      .catch((error) => catchInternal(next, error));
  }

  @del("/:deckId",
      isId("deckId"),
      validate(boom.badRequest("Deck id must be an integer")))
  public remove(req: Request, res: Response, next: NextFunction) {
    const userId = req.user.id;
    const deckId = propAsInt(req.params, "deckId");

    this.decksService.remove(userId, deckId)
      .then((deck) => {

        if (deck === undefined) {
          return next(boom.notFound());
        }

        res.status(status.OK).end();

      })
      .catch((error) => catchInternal(next, error));
  }

}

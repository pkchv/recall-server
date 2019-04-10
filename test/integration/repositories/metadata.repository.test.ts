import "mocha";
import "reflect-metadata";

import { expect } from "chai";
import { isMoment } from "moment";
import { Container } from "typedi";
import { useContainer } from "typeorm";

import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { MetadataRepository } from "../../../src/repositories/metadata.repository";
import { TestDatabase } from "../../setup/test.database";

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("metadata.repository integration tests", function() {
  const db = new TestDatabase();
  let metadataRepository = null;

  beforeEach(async function() {
    useContainer(Container);
    const connection = await db.createConnection({ entities: [Card, Tag, Data, Deck, Metadata] });
    metadataRepository = connection.getCustomRepository(MetadataRepository);
  });

  afterEach(async function() {
    await db.close();
  });

  describe("#init()", function() {
    it("should set initial difficulty", function() {
      const init = metadataRepository.init();
      return expect(init.difficulty).to.not.be.undefined;
    });

    it("should set last review date", function() {
      const init = metadataRepository.init();
      return expect(isMoment(init.lastReview)).to.be.true;
    });

    it("should set next review date", function() {
      const init = metadataRepository.init();
      return expect(isMoment(init.nextReview)).to.be.true;
    });
  });

  describe("transformers", function() {
    it("should transform timestamps to moment", async function() {
      const metadata = metadataRepository.init();
      await metadataRepository.save(metadata);
      const savedMetadata = await metadataRepository.findOne();
      return expect(isMoment(savedMetadata.nextReview)).to.be.true;
    });
  });

});

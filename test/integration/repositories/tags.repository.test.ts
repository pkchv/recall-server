import "mocha";
import "reflect-metadata";

import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised";
import { Container } from "typedi";
import { useContainer } from "typeorm";

import { Card } from "../../../src/entities/Card";
import { Data } from "../../../src/entities/Data";
import { Deck } from "../../../src/entities/Deck";
import { Metadata } from "../../../src/entities/Metadata";
import { Tag } from "../../../src/entities/Tag";
import { TagsRepository } from "../../../src/repositories/tags.repository";
import { TestDatabase } from "../../setup/test.database";

use(chaiAsPromised);

/* tslint:disable:only-arrow-functions object-literal-sort-keys */
describe("tags.repository integration tests", function() {
  const db = new TestDatabase();
  let tagsRepository = null;

  beforeEach(async function() {
    useContainer(Container);
    const connection = await db.createConnection({ entities: [Card, Tag, Data, Deck, Metadata] });
    tagsRepository = connection.getCustomRepository(TagsRepository);
  });

  afterEach(async function() {
    await db.close();
  });

  describe("constraints", function() {
    it("should reject promise when tag name is not unique", function() {
      const name = "tag1";
      const tag1 = tagsRepository.create({
        name,
      });
      const tag2 = tagsRepository.create({
        name,
      });

      const savePromise = tagsRepository.save([tag1, tag2]);

      return expect(savePromise).to.eventually.be.rejected;
    });
  });

  describe("#findOrSave()", function() {
    it("should resolve promise when tag name is not unique", async function() {
      const name = "tag1";
      const tag1 = tagsRepository.create({
        name,
      });
      const tag2 = tagsRepository.create({
        name,
      });
      await tagsRepository.save(tag1);

      const saveOrFindPromise = tagsRepository.findOrSave(tag2);

      return expect(saveOrFindPromise).to.eventually.be.fulfilled;
    });

    it("should resolve to already created tag", async function() {
      const name = "tag1";
      const tag1 = tagsRepository.create({
        name,
      });
      const tag2 = tagsRepository.create({
        name,
      });

      const savedTag = await tagsRepository.save(tag1);
      const saveOrFindTag = await tagsRepository.findOrSave(tag2);

      return expect(saveOrFindTag).to.include({
        id: savedTag.id,
      });
    });
  });

});

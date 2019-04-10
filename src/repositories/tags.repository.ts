import { EntityRepository, Repository } from "typeorm";

import { Tag } from "../entities/Tag";

@EntityRepository(Tag)
export class TagsRepository extends Repository<Tag> {
  public async findOrSave(tag: Tag): Promise<Tag> {
    const retrievedTag = await this.findOne({
      where: { name: tag.name },
    });

    if (retrievedTag !== undefined) {
      return retrievedTag;
    }

    return this.save(tag);
  }
}

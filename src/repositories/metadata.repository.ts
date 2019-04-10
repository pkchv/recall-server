import { EntityRepository, Repository } from "typeorm";

import { Metadata } from "../entities/Metadata";

@EntityRepository(Metadata)
export class MetadataRepository extends Repository<Metadata> {
  public init(): Metadata {
    return Metadata.init();
  }
}

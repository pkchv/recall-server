import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

import { normalizeTag } from "../utility/normalize-tag";
import { Card } from "./Card";

@Entity()
export class Tag {

  public static fromArray(tags: string[]): Tag[] {
    let parsedTags = tags
      .map((tag) => normalizeTag(tag))
      .filter((tag) => tag !== "");
    parsedTags = Array.from(new Set(parsedTags));
    return parsedTags.map((tag) => new Tag(tag));
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public name: string;

  @ManyToMany((type) => Card, (card) => card.tags, { lazy: true })
  public cards: Promise<Card[]>;

  constructor(name?: string) {
    if (name !== undefined) {
      this.name = name;
    }
  }

}

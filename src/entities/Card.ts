import {
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Data } from "./Data";
import { Deck } from "./Deck";
import { Metadata } from "./Metadata";
import { Tag } from "./Tag";

@Entity()
export class Card {

  @PrimaryGeneratedColumn()
  public id: number;

  @Generated("uuid")
  public uuid: string;

  @CreateDateColumn()
  public created: Date;

  @ManyToOne(() => Deck, (deck) => deck.cards)
  public deck: Promise<Deck>;

  @ManyToMany(() => Tag, (tag) => tag.cards, { lazy: true })
  @JoinTable()
  public tags: Promise<Tag[]>;

  @OneToOne(() => Data, (data) => data.card, { lazy: true })
  @JoinColumn()
  public data: Promise<Data>;

  @OneToOne(() => Metadata, (meta) => meta.card, { lazy: true })
  @JoinColumn()
  public metadata: Promise<Metadata>;

  public setTags(tags: Tag[]) {
    this.tags = Promise.resolve(tags);
  }

  public setData(data: Data) {
    this.data = Promise.resolve(data);
  }

  public async toJSON() {
    // tslint:disable:object-literal-sort-keys
    const { id } = await this.deck;
    const { type, object, updated, version } = await this.data;
    const { difficulty, nextReview, lastReview } = await this.metadata;
    const tags = await this.tags;
    const tagNames = tags.map((tag) => tag.name);

    return {
      id: this.id,
      deckId: id,
      created: this.created.toISOString(),
      data: {
        type,
        object,
        updated: updated.toISOString(),
        version,
      },
      metadata: {
        difficulty,
        nextReview: nextReview.toISOString(),
        lastReview: lastReview.toISOString(),
      },
      tags: tagNames,
    };
  }

}

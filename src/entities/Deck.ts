import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

import { Card } from "./Card";

@Entity()
export class Deck {

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ unique: true })
  public name: string;

  @OneToMany(() => Card, (card) => card.deck, { lazy: true })
  public cards: Promise<Card[]>;

  constructor(name?: string) {
    if (name !== undefined) {
      this.name = name;
    }
  }

}

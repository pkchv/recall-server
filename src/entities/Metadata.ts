import moment, { Moment } from "moment";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

import { transformer } from "../utility/moment-transformer";
import { Card } from "./Card";

@Entity()
export class Metadata {

  public static init() {
    const meta = new Metadata();
    const m = moment();
    meta.difficulty = this.DEFAULT_DIFFICULTY;
    meta.consecutiveCorrect = this.DEFAULT_CONSECUTIVE_CORRECT;
    meta.nextReview = m;
    meta.lastReview = m;
    return meta;
  }

  private static readonly DEFAULT_DIFFICULTY = 2.5;
  private static readonly DEFAULT_CONSECUTIVE_CORRECT = 0;

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: "decimal", precision: 9, scale: 8 })
  public difficulty: number;

  @Column({ type: "integer" })
  public consecutiveCorrect: number;

  @Column({ type: "bigint", transformer })
  public nextReview: Moment;

  @Column({ type: "bigint", transformer })
  public lastReview: Moment;

  @OneToOne(() => Card, (card) => card.metadata, { lazy: true })
  public card: Promise<Card>;

}

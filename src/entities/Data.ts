import { Column, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";

import { TCardDataInput } from "../card-data/TCardDataInput";
import { TCardDataObject } from "../card-data/TCardDataObject";
import { Card } from "./Card";

@Entity()
export class Data {

  public static create({ data, type }: TCardDataInput) {
    const d = new Data();
    d.object = data;
    d.type = type;
    d.updated = new Date();
    return d;
  }

  @PrimaryGeneratedColumn()
  public id: number;

  @Column({ type: "int8" })
  public type: number;

  @Column({ type: "simple-json" })
  public object: TCardDataObject;

  @UpdateDateColumn()
  public updated: Date;

  @VersionColumn()
  public version: number;

  @OneToOne(() => Card, (card) => card.data, { lazy: true })
  public card: Promise<Card>;

}

import { CardType } from "../CardType";
import { IBasicData } from "./IBasicData";

export interface IBasic {
  type: CardType.Basic;
  data: IBasicData;
}

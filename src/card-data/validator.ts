import Ajv from "ajv";

import schema from "./schema.json";
import { TCardDataInput } from "./TCardDataInput";

const ajv = new Ajv();
const validator = ajv.compile(schema);

export function isCardDataObject(object: any): object is TCardDataInput {
  return validator(object) === true;
}

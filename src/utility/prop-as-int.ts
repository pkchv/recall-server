import _ from "lodash";

export function propAsInt(params: any, property: string): number {
  return _.toInteger(params[property]);
}

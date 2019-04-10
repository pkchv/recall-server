import moment, { Moment } from "moment";

export const transformer = {
  from: (ts: number) => moment(ts),
  to: (m: Moment) => m.valueOf(),
};

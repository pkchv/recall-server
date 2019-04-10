import { param } from "express-validator/check";
import _ from "lodash";

export const isId = (id: string) => param(id).exists().isInt({ gt: 0 });
export const isTagArray = (tags: any[]): tags is string[] => Array.isArray(tags) && tags.every(_.isString);
export const isPerformance = (value: number) =>  _.isFinite(value) && value >= 0 && value <= 1;

import { Metadata } from "../../entities/Metadata";

export interface IScheduler {
  schedule: (previous: Metadata, performance: number) => Metadata;
}

import moment, { Moment } from "moment";
import { Service } from "typedi";

import { Metadata } from "../entities/Metadata";
import { IScheduler } from "../interfaces/core/IScheduler";

// This piece of code is based on SM2 algorithm:
// Algorithm SM-2, (C) Copyright SuperMemo World, 1991.
// https://www.supermemo.com
// http://www.supermemo.eu

// TODO: consider adding time penalties to out of schedule reviews (shorten next review delay)

@Service("scheduler.service")
export class SchedulerService implements IScheduler {

  // splits user performance into positive and negative review outcomes
  private readonly performanceTreshold = 0.5;

  // base time to next review in days for sm2 polynomial (SuperMemo - 6 days, Anki - 3 days)
  private readonly baseDelay = 3;

  // next review time noise constant in minutes
  private readonly noise = 120;

  // difficulty polynomial weights
  private readonly diffWeights = [0.02, 0.28, -0.8];

  private readonly minDifficulty = 1.3;
  private readonly performanceScaleFactor = 5;
  private readonly thetaFactor = 0.2;

  public schedule(previous: Metadata, performance: number, now: Moment = moment()): Metadata {

    if (!this.isValidPerformanceRating(performance)) {
      throw Error("Performance rating out of range, performance = [0,1]");
    }

    const next = new Metadata();
    next.id = previous.id;
    next.consecutiveCorrect = this.isPositiveTresholdReached(performance)
      ? previous.consecutiveCorrect + 1
      : 0;
    next.difficulty = Math.max(this.minDifficulty, this.difficultyRating(previous.difficulty, performance));
    next.lastReview = now.clone();

    const nextReview = this.nextReviewInDays(performance, next.difficulty, next.consecutiveCorrect);
    next.nextReview = this.delayReview(now.clone(), nextReview, this.noise);

    return next;
  }

  private delayReview(from: Moment, days: number, noiseInterval: number = 0) {
    const noise = (Math.random() - 0.5) * 2;
    const minutes = noise * noiseInterval;

    return from
      .clone()
      .add(days, "days")
      .add(minutes, "minutes");
  }

  private nextReviewInDays(performance: number, difficulty: number, consecutiveCorrect: number) {
    // Positive treshold
    //   compute SM2 algorithm polynomial to determine delay
    //   in days to next review

    // Negative treshold
    //   delay next review linearly up to 1 day in the future
    //   based on user performance (= [0, 0.5])

    return this.isPositiveTresholdReached(performance)
      ? this.baseDelay * Math.pow(difficulty, this.thetaFactor * consecutiveCorrect)
      : 2 * performance;
  }

  private isValidPerformanceRating(performance: number): boolean {
    return performance >= 0 && performance <= 1;
  }

  private difficultyRating(difficulty: number, performance: number): number {
    return difficulty + this.difficultyDelta(this.performanceScaleFactor * performance);
  }

  private difficultyDelta(performance: number) {
    return this.diffWeights[0] * Math.pow(performance, 2) + this.diffWeights[1] * performance + this.diffWeights[2];
  }

  private isPositiveTresholdReached(performance: number): boolean {
    return performance >= this.performanceTreshold;
  }

}

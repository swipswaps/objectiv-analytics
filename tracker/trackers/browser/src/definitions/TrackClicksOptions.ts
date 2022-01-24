/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { literal, object, optional, union } from 'superstruct';
import { FlushQueueOptions } from './FlushQueueOptions';
import { WaitForQueueOptions } from './WaitForQueueOptions';

/**
 * The Options attribute of the TrackClicks TaggingAttribute
 */
export const TrackClicksOptions = union([
  literal(undefined),
  object({
    waitForQueue: optional(WaitForQueueOptions),
    flushQueue: optional(FlushQueueOptions),
  }),
]);
export type TrackClicksOptions =
  | undefined
  | {
      waitForQueue?: WaitForQueueOptions;
      flushQueue?: FlushQueueOptions;
    };

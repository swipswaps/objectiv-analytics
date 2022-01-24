/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { number, object, optional } from 'superstruct';
import { FlushQueueOptions } from './FlushQueueOptions';

/**
 * WaitUntilTracked Options for TrackClick TaggingAttribute
 */
export const WaitUntilTrackedOptions = object({
  intervalMs: optional(number()),
  timeoutMs: optional(number()),
  flushQueue: optional(FlushQueueOptions),
});
export type WaitUntilTrackedOptions = {
  intervalMs?: number;
  timeoutMs?: number;
  flushQueue?: FlushQueueOptions;
};

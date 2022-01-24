/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { number, object, optional, union } from 'superstruct';

/**
 * WaitForQueueOptions Options for TrackClicks TaggingAttribute
 */
export const WaitForQueueOptions = union([
  object({
    intervalMs: optional(number()),
    timeoutMs: optional(number()),
  }),
]);
export type WaitForQueueOptions = {
  intervalMs?: number;
  timeoutMs?: number;
};

import { Infer, number, object, optional, union } from 'superstruct';

/**
 * WaitForQueueOptions Options for TrackClicks TaggingAttribute
 */
export const WaitForQueueOptions = union([
  object({
    intervalMs: optional(number()),
    timeoutMs: optional(number()),
  }),
]);
export type WaitForQueueOptions = Infer<typeof WaitForQueueOptions>;

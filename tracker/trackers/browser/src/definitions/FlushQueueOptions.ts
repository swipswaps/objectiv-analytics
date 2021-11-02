import { Infer, literal, union } from 'superstruct';

/**
 * FlushQueue Options for TrackClicks TaggingAttribute
 */
export const FlushQueueOptions = union([literal(false), literal(true), literal('onTimeout')]);

export type FlushQueueOptions = Infer<typeof FlushQueueOptions>;

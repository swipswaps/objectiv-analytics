import { Infer, optional } from 'superstruct';
import { StringifiedTaggingAttributes } from './StringifiedTaggingAttributes';

/**
 * The object returned by `tagLocation` and its shorthands
 */
export const TagLocationReturnValue = optional(StringifiedTaggingAttributes);

export type TagLocationReturnValue = Infer<typeof TagLocationReturnValue>;

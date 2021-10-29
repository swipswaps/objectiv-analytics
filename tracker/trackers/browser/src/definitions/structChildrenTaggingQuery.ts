import { array, Infer, object, optional, string } from 'superstruct';
import { StringifiedTaggingAttributes } from './structTaggingAttributes';

/**
 * The parameters of `tagChild`
 */
export const ChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: optional(StringifiedTaggingAttributes),
});

/**
 * The parameters of `tagChild` where `tagAs` is a valid StringifiedTaggingAttributes
 */
export const ValidChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: StringifiedTaggingAttributes,
});
export type ChildrenTaggingQuery = Infer<typeof ChildrenTaggingQuery>;

/**
 * The parameters of `tagChildren`
 */
export const ChildrenTaggingQueries = array(ChildrenTaggingQuery);
export type ChildrenTaggingQueries = Infer<typeof ChildrenTaggingQueries>;

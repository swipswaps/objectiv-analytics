import { Infer, object, string } from 'superstruct';
import { TagLocationAttributes } from './TagLocationAttributes';

/**
 * The parameters of `tagChild` where `tagAs` is a valid TagLocationAttributes
 */
export const ValidChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: TagLocationAttributes,
});
export type ValidChildrenTaggingQuery = Infer<typeof ValidChildrenTaggingQuery>;

import { Infer, object, string } from 'superstruct';
import { StringifiedTaggingAttributes } from './TaggingAttributes';

/**
 * The parameters of `tagChild` where `tagAs` is a valid StringifiedTaggingAttributes
 */
export const ValidChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: StringifiedTaggingAttributes,
});
export type ValidChildrenTaggingQuery = Infer<typeof ValidChildrenTaggingQuery>;

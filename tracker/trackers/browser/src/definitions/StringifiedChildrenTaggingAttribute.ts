import { Infer, object, string } from 'superstruct';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * The stringified version of the `ChildrenTaggingAttributes`
 */
export const StringifiedChildrenTaggingAttributes = object({
  [TaggingAttribute.tagChildren]: string(),
});
export type StringifiedChildrenTaggingAttributes = Infer<typeof StringifiedChildrenTaggingAttributes>;

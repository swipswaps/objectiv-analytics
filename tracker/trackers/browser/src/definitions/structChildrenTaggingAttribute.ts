import { array, assert, create, Infer, object, string } from 'superstruct';
import { ChildrenTaggingQueries, ChildrenTaggingQuery, ValidChildrenTaggingQuery } from './structChildrenTaggingQuery';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * The `tagChildren` Tagging Attribute
 */
export const ChildrenTaggingAttributes = object({
  [TaggingAttribute.tagChildren]: array(ChildrenTaggingQuery),
});
export type ChildrenTaggingAttributes = Infer<typeof ChildrenTaggingAttributes>;

/**
 * The stringified version of the `tagChildren` Tagging Attribute
 */
export const StringifiedChildrenTaggingAttributes = object({
  [TaggingAttribute.tagChildren]: string(),
});
export type StringifiedChildrenTaggingAttributes = Infer<typeof StringifiedChildrenTaggingAttributes>;

/**
 * Children Tagging Attribute Stringifier and Parser
 */
export const stringifyChildrenTaggingAttribute = (queries: ChildrenTaggingQueries) => {
  if (!(typeof queries === 'object')) {
    throw new Error(`Visibility must be an object, received: ${JSON.stringify(queries)}`);
  }
  queries.forEach((query) => assert(query, ValidChildrenTaggingQuery));
  return create(JSON.stringify(queries), string());
};

export const parseChildrenTaggingAttribute = (stringifiedChildrenTaggingAttribute: string | null) => {
  if (stringifiedChildrenTaggingAttribute === null) {
    throw new Error('Received `null` while attempting to parse Children Tagging Attribute');
  }

  const queries = create(JSON.parse(stringifiedChildrenTaggingAttribute), ChildrenTaggingQueries);
  return create(queries, array(ValidChildrenTaggingQuery));
};

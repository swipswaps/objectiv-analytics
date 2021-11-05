import { array, create } from 'superstruct';
import { ChildrenTaggingQueries } from '../../definitions/ChildrenTaggingQueries';
import { ValidChildrenTaggingQuery } from '../../definitions/ValidChildrenTaggingQuery';

/**
 * ChildrenTaggingAttribute parser
 */
export const parseTagChildren = (stringifiedChildrenTaggingAttribute: string | null) => {
  if (stringifiedChildrenTaggingAttribute === null) {
    throw new Error('Received `null` while attempting to parse Children Tagging Attribute');
  }

  const queries = create(JSON.parse(stringifiedChildrenTaggingAttribute), ChildrenTaggingQueries);
  return create(queries, array(ValidChildrenTaggingQuery));
};

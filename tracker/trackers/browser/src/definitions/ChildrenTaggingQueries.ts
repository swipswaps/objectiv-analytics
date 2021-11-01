import { array, Infer } from 'superstruct';
import { ChildrenTaggingQuery } from './ChildrenTaggingQuery';

/**
 * The parameters of `tagChildren`
 */
export const ChildrenTaggingQueries = array(ChildrenTaggingQuery);
export type ChildrenTaggingQueries = Infer<typeof ChildrenTaggingQueries>;

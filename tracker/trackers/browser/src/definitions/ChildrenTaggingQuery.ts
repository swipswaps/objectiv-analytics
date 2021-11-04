/*
 * Copyright 2021 Objectiv B.V.
 */

import { Infer, object, optional, string } from 'superstruct';
import { StringifiedLocationTaggingAttributes } from './StringifiedLocationTaggingAttributes';

/**
 * The parameters of `tagChild`
 */
export const ChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: optional(StringifiedLocationTaggingAttributes),
});
export type ChildrenTaggingQuery = Infer<typeof ChildrenTaggingQuery>;

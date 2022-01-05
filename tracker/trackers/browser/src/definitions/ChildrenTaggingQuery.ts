/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { Infer, object, optional, string } from 'superstruct';
import { TagLocationAttributes } from './TagLocationAttributes';

/**
 * The parameters of `tagChild`
 */
export const ChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: optional(TagLocationAttributes),
});
export type ChildrenTaggingQuery = Infer<typeof ChildrenTaggingQuery>;

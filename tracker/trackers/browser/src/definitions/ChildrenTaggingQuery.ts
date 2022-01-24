/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { object, optional, string } from 'superstruct';
import { TagLocationAttributes } from './TagLocationAttributes';

/**
 * The parameters of `tagChild`
 */
export const ChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: optional(TagLocationAttributes),
});
export type ChildrenTaggingQuery = {
  queryAll: string;
  tagAs?: TagLocationAttributes;
};

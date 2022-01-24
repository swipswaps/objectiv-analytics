/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { object, string } from 'superstruct';
import { TagLocationAttributes } from './TagLocationAttributes';

/**
 * The parameters of `tagChild` where `tagAs` is a valid TagLocationAttributes
 */
export const ValidChildrenTaggingQuery = object({
  queryAll: string(),
  tagAs: TagLocationAttributes,
});
export type ValidChildrenTaggingQuery = {
  queryAll: string;
  tagAs: TagLocationAttributes;
};

/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { Infer, object, optional, string } from 'superstruct';
import { TaggingAttribute } from './TaggingAttribute';
import { Uuid } from './Uuid';

/**
 * The object that Location Taggers return, stringified
 */
export const TagLocationAttributes = object({
  [TaggingAttribute.elementId]: Uuid,
  [TaggingAttribute.parentElementId]: optional(Uuid),
  [TaggingAttribute.context]: string(),
  [TaggingAttribute.trackClicks]: optional(string()),
  [TaggingAttribute.trackBlurs]: optional(string()),
  [TaggingAttribute.trackVisibility]: optional(string()),
  [TaggingAttribute.validate]: optional(string()),
});
export type TagLocationAttributes = Infer<typeof TagLocationAttributes>;

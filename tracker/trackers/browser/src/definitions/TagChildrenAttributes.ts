/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { object, string } from 'superstruct';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * The stringified version of the `ChildrenTaggingAttributes`
 */
export const TagChildrenAttributes = object({
  [TaggingAttribute.tagChildren]: string(),
});

export type TagChildrenAttributes = {
  [TaggingAttribute.tagChildren]: string;
};

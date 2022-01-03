/*
 * Copyright 2022 Objectiv B.V.
 */

import { Infer, object, string } from 'superstruct';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * The stringified version of the `ChildrenTaggingAttributes`
 */
export const TagChildrenAttributes = object({
  [TaggingAttribute.tagChildren]: string(),
});

export type TagChildrenAttributes = Infer<typeof TagChildrenAttributes>;

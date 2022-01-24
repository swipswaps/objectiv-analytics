/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { optional } from 'superstruct';
import { TagChildrenAttributes } from './TagChildrenAttributes';

/**
 * The definition of the object returned by `tagChildren` and `tagChild`
 */
export const TagChildrenReturnValue = optional(TagChildrenAttributes);

export type TagChildrenReturnValue = TagChildrenAttributes | undefined;

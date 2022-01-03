/*
 * Copyright 2022 Objectiv B.V.
 */

import { Infer, optional } from 'superstruct';
import { TagChildrenAttributes } from './TagChildrenAttributes';

/**
 * The definition of the object returned by `tagChildren` and `tagChild`
 */
export const TagChildrenReturnValue = optional(TagChildrenAttributes);

export type TagChildrenReturnValue = Infer<typeof TagChildrenReturnValue>;

/*
 * Copyright 2022 Objectiv B.V.
 */

import { Infer, optional } from 'superstruct';
import { TagLocationAttributes } from './TagLocationAttributes';

/**
 * The object returned by `tagLocation` and its shorthands
 */
export const TagLocationReturnValue = optional(TagLocationAttributes);

export type TagLocationReturnValue = Infer<typeof TagLocationReturnValue>;

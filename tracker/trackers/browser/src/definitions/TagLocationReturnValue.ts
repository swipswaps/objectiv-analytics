/*
 * Copyright 2021 Objectiv B.V.
 */

import { Infer, optional } from 'superstruct';
import { StringifiedLocationTaggingAttributes } from './StringifiedLocationTaggingAttributes';

/**
 * The object returned by `tagLocation` and its shorthands
 */
export const TagLocationReturnValue = optional(StringifiedLocationTaggingAttributes);

export type TagLocationReturnValue = Infer<typeof TagLocationReturnValue>;

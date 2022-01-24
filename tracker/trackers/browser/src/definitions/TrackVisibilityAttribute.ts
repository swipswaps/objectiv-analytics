/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { boolean, literal, object, union } from 'superstruct';

/**
 * The definition of the `trackVisibility` Tagging Attribute
 */
export const TrackVisibilityAttribute = union([
  object({ mode: literal('auto') }),
  object({ mode: literal('manual'), isVisible: boolean() }),
]);

export type TrackVisibilityAttribute = { mode: 'auto' } | { mode: 'manual'; isVisible: boolean };

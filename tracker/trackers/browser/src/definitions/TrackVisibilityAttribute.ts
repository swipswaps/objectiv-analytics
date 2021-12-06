/*
 * Copyright 2021 Objectiv B.V.
 */

import { boolean, Infer, literal, object, union } from 'superstruct';

/**
 * The definition of the `trackVisibilityEvent` Tagging Attribute
 */
export const TrackVisibilityAttribute = union([
  object({ mode: literal('auto') }),
  object({ mode: literal('manual'), isVisible: boolean() }),
]);

export type TrackVisibilityAttribute = Infer<typeof TrackVisibilityAttribute>;

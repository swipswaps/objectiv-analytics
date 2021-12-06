/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackVisibilityAttribute } from '../../definitions/TrackVisibilityAttribute';
import { parseJson } from './parseJson';

/**
 * `trackVisibilityEvent` Tagging Attribute parser
 */
export const parseTrackVisibility = (stringifiedTrackVisibilityAttribute: string | null) => {
  return parseJson(stringifiedTrackVisibilityAttribute, TrackVisibilityAttribute);
};

/*
 * Copyright 2022 Objectiv B.V.
 */

import { TrackVisibilityAttribute } from '../../definitions/TrackVisibilityAttribute';
import { parseJson } from './parseJson';

/**
 * `trackVisibility` Tagging Attribute parser
 */
export const parseTrackVisibility = (stringifiedTrackVisibilityAttribute: string | null) => {
  return parseJson(stringifiedTrackVisibilityAttribute, TrackVisibilityAttribute);
};

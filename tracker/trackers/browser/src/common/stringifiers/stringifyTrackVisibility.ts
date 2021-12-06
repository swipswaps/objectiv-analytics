/*
 * Copyright 2021 Objectiv B.V.
 */

import { TrackVisibilityAttribute } from '../../definitions/TrackVisibilityAttribute';
import { stringifyJson } from './stringifyJson';

/**
 * `trackVisibility` Tagging Attribute stringifier
 */
export const stringifyTrackVisibility = (trackVisibilityAttribute: TrackVisibilityAttribute) => {
  if (!(typeof trackVisibilityAttribute === 'object')) {
    throw new Error(`trackVisibility must be an object, received: ${JSON.stringify(trackVisibilityAttribute)}`);
  }
  return stringifyJson(trackVisibilityAttribute, TrackVisibilityAttribute);
};

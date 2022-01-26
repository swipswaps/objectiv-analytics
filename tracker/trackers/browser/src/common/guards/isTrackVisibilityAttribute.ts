/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackVisibilityAttribute } from '../../definitions/TrackVisibilityAttribute';

/**
 * A type guard to determine if the given object is a TrackVisibilityAttribute.
 */
export const isTrackVisibilityAttribute = (
  object: Partial<TrackVisibilityAttribute>
): object is TrackVisibilityAttribute => {
  if (typeof object !== 'object' || object === null) {
    return false;
  }

  if (!object.mode) {
    return false;
  }

  if (!['auto', 'manual'].includes(object.mode)) {
    return false;
  }

  if (object.mode === 'auto' && object.hasOwnProperty('isVisible')) {
    return false;
  }

  if (object.mode === 'manual' && !object.hasOwnProperty('isVisible')) {
    return false;
  }

  if (object.mode === 'manual' && typeof object.isVisible !== 'boolean') {
    return false;
  }

  return true;
};

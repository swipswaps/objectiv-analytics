/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { isTrackVisibilityAttribute } from '../guards/isTrackVisibilityAttribute';
import { parseJson } from './parseJson';

/**
 * `trackVisibility` Tagging Attribute parser
 */
export const parseTrackVisibility = (stringifiedTrackVisibilityAttribute: string | null) => {
  const trackVisibilityAttribute = parseJson(stringifiedTrackVisibilityAttribute);

  if (!isTrackVisibilityAttribute(trackVisibilityAttribute)) {
    throw new Error(`trackVisibility attribute is not valid: ${JSON.stringify(stringifiedTrackVisibilityAttribute)}`);
  }

  return trackVisibilityAttribute;
};

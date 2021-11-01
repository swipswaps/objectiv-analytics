import { TrackVisibilityAttribute } from '../definitions/TrackVisibilityAttribute';
import { parseJson } from './parseJson';

/**
 * `trackVisibility` Tagging Attribute parser
 */
export const parseTrackVisibilityAttribute = (stringifiedTrackVisibilityAttribute: string | null) => {
  return parseJson(stringifiedTrackVisibilityAttribute, TrackVisibilityAttribute);
};

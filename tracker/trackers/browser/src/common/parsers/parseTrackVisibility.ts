import { TrackVisibilityAttribute } from '../../definitions/TrackVisibilityAttribute';
import { parseJson } from './parseJson';

/**
 * `trackVisibility` Tagging Attribute parser
 */
export const parseTrackVisibility = (stringifiedTrackVisibilityAttribute: string | null) => {
  return parseJson(stringifiedTrackVisibilityAttribute, TrackVisibilityAttribute);
};

import {
  makeButtonContext,
  makeExpandableSectionContext,
  makeInputContext,
  makeLinkContext,
  makeMediaPlayerContext,
  makeNavigationContext,
  makeOverlayContext,
  makeSectionContext,
} from '@objectiv/tracker-core';
import { func, Infer, intersection, object, optional, string } from 'superstruct';
import { track, TrackOptions } from '../tracker/track';

/**
 * Track Location helpers automatically factor Context Instances and use `track` internally.
 */
export const TrackHelperParameters = object({
  id: string(),
  options: optional(TrackOptions),
  onError: optional(func()),
});
export type TrackHelperParameters = Infer<typeof TrackHelperParameters>;

/**
 * TrackElement helper
 */
export const trackElement = ({ id, options, onError }: TrackHelperParameters) => {
  return track({ instance: makeSectionContext({ id }), options, onError });
};

/**
 * TrackExpandableElement helper
 */
export const trackExpandableElement = ({ id, options, onError }: TrackHelperParameters) => {
  return track({ instance: makeExpandableSectionContext({ id }), options, onError });
};

/**
 * TrackInput helper
 */
export const trackInput = ({ id, options, onError }: TrackHelperParameters) => {
  return track({ instance: makeInputContext({ id }), options, onError });
};

/**
 * TrackButton helper
 */
export const TrackButtonParameters = intersection([TrackHelperParameters, object({ text: string() })]);
export type TrackButtonParameters = Infer<typeof TrackButtonParameters>;
export const trackButton = ({ id, text, options, onError }: TrackButtonParameters) => {
  return track({ instance: makeButtonContext({ id, text }), options, onError });
};

/**
 * TrackLink helper
 */
export const TrackLinkParameters = intersection([TrackHelperParameters, object({ text: string(), href: string() })]);
export type TrackLinkParameters = Infer<typeof TrackLinkParameters>;
export const trackLink = ({ id, text, href, options, onError }: TrackLinkParameters) => {
  return track({ instance: makeLinkContext({ id, text, href }), options, onError });
};

/**
 * TrackMediaPlayer helper
 */
export const trackMediaPlayer = ({ id, options, onError }: TrackHelperParameters) => {
  return track({ instance: makeMediaPlayerContext({ id }), options, onError });
};

/**
 * TrackNavigation helper
 */
export const trackNavigation = ({ id, options, onError }: TrackHelperParameters) => {
  return track({ instance: makeNavigationContext({ id }), options, onError });
};

/**
 * TrackOverlay helper
 */
export const trackOverlay = ({ id, options, onError }: TrackHelperParameters) => {
  return track({ instance: makeOverlayContext({ id }), options, onError });
};

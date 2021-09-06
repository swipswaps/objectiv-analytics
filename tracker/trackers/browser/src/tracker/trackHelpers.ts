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
import { assign, create, Infer, object, pick, string } from 'superstruct';
import { track, TrackParameters } from '../tracker/track';
import { trackErrorHandler } from './trackErrorHandler';

/**
 * Track Location helpers automatically factor Context Instances and use `track` internally.
 */
export const TrackHelperParameters = assign(
  pick(TrackParameters, ['options', 'onError']),
  object({
    id: string(),
  })
);
export type TrackHelperParameters = Infer<typeof TrackHelperParameters>;

/**
 * TrackElement helper
 */
export const trackElement = (parameters: TrackHelperParameters) => {
  try {
    const { id, options, onError } = create(parameters, TrackHelperParameters);
    return track({ instance: makeSectionContext({ id }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackExpandableElement helper
 */
export const trackExpandableElement = (parameters: TrackHelperParameters) => {
  try {
    const { id, options, onError } = create(parameters, TrackHelperParameters);
    return track({ instance: makeExpandableSectionContext({ id }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackInput helper
 */
export const trackInput = (parameters: TrackHelperParameters) => {
  try {
    const { id, options, onError } = create(parameters, TrackHelperParameters);
    return track({ instance: makeInputContext({ id }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackButton helper
 */
export const TrackButtonParameters = assign(TrackHelperParameters, object({ text: string() }));
export type TrackButtonParameters = Infer<typeof TrackButtonParameters>;
export const trackButton = (parameters: TrackButtonParameters) => {
  try {
    const { id, text, options, onError } = create(parameters, TrackButtonParameters);
    return track({ instance: makeButtonContext({ id, text }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackLink helper
 */
export const TrackLinkParameters = assign(TrackHelperParameters, object({ text: string(), href: string() }));
export type TrackLinkParameters = Infer<typeof TrackLinkParameters>;
export const trackLink = (parameters: TrackLinkParameters) => {
  try {
    const { id, text, href, options, onError } = create(parameters, TrackLinkParameters);
    return track({ instance: makeLinkContext({ id, text, href }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackMediaPlayer helper
 */
export const trackMediaPlayer = (parameters: TrackHelperParameters) => {
  try {
    const { id, options, onError } = create(parameters, TrackHelperParameters);
    return track({ instance: makeMediaPlayerContext({ id }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackNavigation helper
 */
export const trackNavigation = (parameters: TrackHelperParameters) => {
  try {
    const { id, options, onError } = create(parameters, TrackHelperParameters);
    return track({ instance: makeNavigationContext({ id }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackOverlay helper
 */
export const trackOverlay = (parameters: TrackHelperParameters) => {
  try {
    const { id, options, onError } = create(parameters, TrackHelperParameters);
    return track({ instance: makeOverlayContext({ id }), options, onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

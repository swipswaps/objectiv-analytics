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
import { assign, create, object, pick, string } from 'superstruct';
import { track, TrackOptions, TrackParameters, TrackReturnValue } from '../tracker/track';
import { trackErrorHandler, TrackOnErrorCallback } from './trackErrorHandler';

/**
 * Track Location helpers automatically factor Context Instances and use `track` internally.
 */
export const TrackHelperParameters = assign(
  pick(TrackParameters, ['options', 'onError']),
  object({
    id: string(),
  })
);
export type TrackHelperParameters = {
  id: string;
  options?: TrackOptions;
  onError?: TrackOnErrorCallback;
};

/**
 * TrackElement helper
 */
export const trackElement = (parameters: TrackHelperParameters): TrackReturnValue => {
  try {
    const { id, options } = create(parameters, TrackHelperParameters);
    return track({ instance: makeSectionContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackExpandableElement helper
 */
export const trackExpandableElement = (parameters: TrackHelperParameters): TrackReturnValue => {
  try {
    const { id, options } = create(parameters, TrackHelperParameters);
    return track({ instance: makeExpandableSectionContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackInput helper
 */
export const trackInput = (parameters: TrackHelperParameters): TrackReturnValue => {
  try {
    const { id, options } = create(parameters, TrackHelperParameters);
    return track({ instance: makeInputContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackButton helper
 */
export const TrackButtonParameters = assign(TrackHelperParameters, object({ text: string() }));
export type TrackButtonParameters = TrackHelperParameters & { text: string };
export const trackButton = (parameters: TrackButtonParameters): TrackReturnValue => {
  try {
    const { id, text, options } = create(parameters, TrackButtonParameters);
    return track({ instance: makeButtonContext({ id, text }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackLink helper
 */
export const TrackLinkParameters = assign(TrackHelperParameters, object({ text: string(), href: string() }));
export type TrackLinkParameters = TrackHelperParameters & { text: string; href: string };
export const trackLink = (parameters: TrackLinkParameters): TrackReturnValue => {
  try {
    const { id, text, href, options } = create(parameters, TrackLinkParameters);
    return track({ instance: makeLinkContext({ id, text, href }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackMediaPlayer helper
 */
export const trackMediaPlayer = (parameters: TrackHelperParameters): TrackReturnValue => {
  try {
    const { id, options } = create(parameters, TrackHelperParameters);
    return track({ instance: makeMediaPlayerContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackNavigation helper
 */
export const trackNavigation = (parameters: TrackHelperParameters): TrackReturnValue => {
  try {
    const { id, options } = create(parameters, TrackHelperParameters);
    return track({ instance: makeNavigationContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

/**
 * TrackOverlay helper
 */
export const trackOverlay = (parameters: TrackHelperParameters): TrackReturnValue => {
  try {
    const { id, options } = create(parameters, TrackHelperParameters);
    return track({ instance: makeOverlayContext({ id }), options, onError: parameters.onError });
  } catch (error) {
    return trackErrorHandler(error, parameters);
  }
};

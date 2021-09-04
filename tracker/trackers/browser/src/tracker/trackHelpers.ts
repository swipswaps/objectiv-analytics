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
import { z } from "zod";
import { track } from "../tracker/track";
import { TrackOptions } from "../tracker/track";

/**
 * Track Location helpers automatically factor Context Instances and use `track` internally.
 */
export const TrackHelperParameters = z.object({ id: z.string(), options: TrackOptions.optional() });

/**
 * TrackElement helper
 */
export const TrackElementFunction = z.function(z.tuple([TrackHelperParameters]));
export const trackElement = TrackElementFunction.validate(({ id, options }) => {
  return track({ instance: makeSectionContext({ id }), options });
});

/**
 * TrackExpandableElement helper
 */
export const TrackExpandableElementFunction = z.function(z.tuple([TrackHelperParameters]));
export const trackExpandableElement = TrackExpandableElementFunction.validate(({ id, options }) => {
  return track({ instance: makeExpandableSectionContext({ id }), options });
});

/**
 * TrackInput helper
 */
export const TrackInputFunction = z.function(z.tuple([TrackHelperParameters]));
export const trackInput = TrackInputFunction.validate(({ id, options }) => {
  return track({ instance: makeInputContext({ id }), options });
});

/**
 * TrackButton helper
 */
export const TrackButtonParameters = TrackHelperParameters.extend({ text: z.string() });
export const TrackButtonFunction = z.function(z.tuple([TrackButtonParameters]));
export const trackButton = TrackButtonFunction.validate(({ id, text, options }) => {
  return track({ instance: makeButtonContext({ id, text }), options });
});

/**
 * TrackLink helper
 */
export const TrackLinkParameters = TrackHelperParameters.extend({ text: z.string(), href: z.string() });
export const TrackLinkFunction = z.function(z.tuple([TrackLinkParameters]));
export const trackLink = TrackLinkFunction.validate(({ id, text, href, options }) => {
  return track({ instance: makeLinkContext({ id, text, href }), options });
});

/**
 * TrackMediaPlayer helper
 */
export const TrackMediaPlayerFunction = z.function(z.tuple([TrackHelperParameters]));
export const trackMediaPlayer = TrackMediaPlayerFunction.validate(({ id, options }) => {
  return track({ instance: makeMediaPlayerContext({ id }), options });
});

/**
 * TrackNavigation helper
 */
export const TrackNavigationFunction = z.function(z.tuple([TrackHelperParameters]));
export const trackNavigation = TrackNavigationFunction.validate(({ id, options }) => {
  return track({ instance: makeNavigationContext({ id }), options });
});

/**
 * TrackOverlay helper
 */
export const TrackOverlayFunction = z.function(z.tuple([TrackHelperParameters]));
export const trackOverlay = TrackOverlayFunction.validate(({ id, options }) => {
  return track({ instance: makeOverlayContext({ id }), options });
});

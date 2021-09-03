import {
  cleanObjectFromDiscriminatingProperties,
  makeButtonContext,
  makeExpandableSectionContext,
  makeInputContext,
  makeLinkContext,
  makeMediaPlayerContext,
  makeNavigationContext,
  makeOverlayContext,
  makeSectionContext,
} from '@objectiv/tracker-core';
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { LocationContext } from '../Contexts';
import {
  ContextType,
  TrackBlursDefaultValueByContextType,
  TrackClicksDefaultValueByContextType,
  TrackVisibilityDefaultValueByContextType,
} from '../ContextType';
import {
  ElementTrackingAttribute,
  StringifiedElementTrackingAttributes,
  TrackingAttributeVisibility,
} from '../TrackingAttributes';

/**
 * The options parameter of the `track` api. Used to override default behavior
 */
export const TrackOptions = z.object({
  trackClicks: z.optional(z.boolean()),
  trackBlurs: z.optional(z.boolean()),
  trackVisibility: z.optional(TrackingAttributeVisibility),
  parentTracker: z.optional(StringifiedElementTrackingAttributes),
});
export type TrackOptions = z.infer<typeof TrackOptions>;

/**
 * Used to decorate a Trackable Element with our Tracking Attributes.
 *
 * Returns an object containing the tracking attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For most commonly used Locations see the helper functions below.
 *
 * Track Examples
 *
 *    track({ instance: makeElementContext({ id: 'section-id' }) })
 *    track({ instance: makeElementContext({ id: 'section-id' }), { trackClicks: true } })
 *
 * Track Helpers Examples
 *
 *    trackElement({ id: 'section-id', options: { trackClicks: true } })
 *    trackButton({ id: 'section-id', text: 'button text' })
 *
 */
export const TrackParameters = z.object({ instance: LocationContext, options: z.optional(TrackOptions) });
export const TrackReturnValue = StringifiedElementTrackingAttributes;
export const TrackFunction = z.function(z.tuple([TrackParameters]), TrackReturnValue);
export const track = TrackFunction.validate(({ instance, options }) => {
  const elementId = uuidv4();

  // Clean up the instance from discriminatory properties
  cleanObjectFromDiscriminatingProperties(instance);

  // Get the current _context_type from the instance
  const contextType = instance._context_type as ContextType;

  // Process options. Gather default attribute values
  let trackClicks = TrackClicksDefaultValueByContextType.get(contextType);
  let trackBlurs = TrackBlursDefaultValueByContextType.get(contextType);
  let trackVisibility = TrackVisibilityDefaultValueByContextType.get(contextType);
  let parentElementId = undefined;

  // Process options and apply overrides, if any
  if (options !== undefined) {
    if (options.trackClicks !== undefined) {
      trackClicks = options.trackClicks;
    }
    if (options.trackBlurs !== undefined) {
      trackBlurs = options.trackBlurs;
    }
    if (options.trackVisibility !== undefined) {
      trackVisibility = options.trackVisibility;
    }
    if (options.parentTracker !== undefined) {
      parentElementId = options.parentTracker[ElementTrackingAttribute.elementId];
    }
  }

  return {
    [ElementTrackingAttribute.elementId]: elementId,
    [ElementTrackingAttribute.parentElementId]: parentElementId,
    [ElementTrackingAttribute.context]: JSON.stringify(instance),
    [ElementTrackingAttribute.trackClicks]: JSON.stringify(trackClicks),
    [ElementTrackingAttribute.trackBlurs]: JSON.stringify(trackBlurs),
    [ElementTrackingAttribute.trackVisibility]: JSON.stringify(trackVisibility),
  };
})

/**
 * Location Context specific helpers. To make it easier to track common HTML Elements
 */
export const TrackHelperParameters = z.object({ id: z.string(), options: z.optional(TrackOptions) });

/**
 * TrackElement helper
 */
export const TrackElementFunction = z.function(z.tuple([TrackHelperParameters]), TrackReturnValue);
export const trackElement = TrackElementFunction.validate(({ id, options }) => {
  return track({ instance: makeSectionContext({ id }), options });
});

/**
 * TrackExpandableElement helper
 */
export const TrackExpandableElementFunction = z.function(z.tuple([TrackHelperParameters]), TrackReturnValue);
export const trackExpandableElement = TrackExpandableElementFunction.validate(({ id, options }) => {
  return track({ instance: makeExpandableSectionContext({ id }), options });
});

/**
 * TrackInput helper
 */
export const TrackInputFunction = z.function(z.tuple([TrackHelperParameters]), TrackReturnValue);
export const trackInput = TrackInputFunction.validate(({ id, options }) => {
  return track({ instance: makeInputContext({ id }), options });
});

/**
 * TrackButton helper
 */
export const TrackButtonParameters = TrackHelperParameters.extend({ text: z.string() });
export const TrackButtonFunction = z.function(z.tuple([TrackButtonParameters]), TrackReturnValue);
export const trackButton = TrackButtonFunction.validate(({ id, text, options }) => {
  return track({ instance: makeButtonContext({ id, text }), options });
});

/**
 * TrackLink helper
 */
export const TrackLinkParameters = TrackHelperParameters.extend({ text: z.string(), href: z.string() });
export const TrackLinkFunction = z.function(z.tuple([TrackLinkParameters]), TrackReturnValue);
export const trackLink = TrackLinkFunction.validate(({ id, text, href, options }) => {
  return track({ instance: makeLinkContext({ id, text, href }), options });
});

/**
 * TrackMediaPlayer helper
 */
export const TrackMediaPlayerFunction = z.function(z.tuple([TrackHelperParameters]), TrackReturnValue);
export const trackMediaPlayer = TrackMediaPlayerFunction.validate(({ id, options }) => {
  return track({ instance: makeMediaPlayerContext({ id }), options });
});

/**
 * TrackNavigation helper
 */
export const TrackNavigationFunction = z.function(z.tuple([TrackHelperParameters]), TrackReturnValue);
export const trackNavigation = TrackNavigationFunction.validate(({ id, options }) => {
  return track({ instance: makeNavigationContext({ id }), options });
});

/**
 * TrackOverlay helper
 */
export const TrackOverlayFunction = z.function(z.tuple([TrackHelperParameters]), TrackReturnValue);
export const trackOverlay = TrackOverlayFunction.validate(({ id, options }) => {
  return track({ instance: makeOverlayContext({ id }), options });
});

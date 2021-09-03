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
 * The parameters of the `track` api
 */
export const TrackParameters = z.tuple([
  z.object({
    instance: LocationContext,
    options: z.optional(TrackOptions),
  })
]);

/**
 * The `track` function schema validator
 */
const TrackFunction = z.function(TrackParameters, StringifiedElementTrackingAttributes);

/**
 * Used to decorate a Trackable Element with our Tracking Attributes. Can be called in three ways:
 *
 *    trackElement(<id>)
 *    trackElement(<id>, <ContextType>, <extraAttributes object>, <options object>)
 *
 * Examples
 *
 *    trackElement('section id')
 *    trackElement('button', ContextType.button, { text: 'Click Me' }, { trackClicks: true })
 *
 * Returns an object containing the tracking attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For most commonly used Elements / Location Contexts see also the helper functions below.
 */
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
type TrackButtonParameters = {
  id: string;
  text: string;
  options?: TrackOptions;
};
export const trackButton = ({ id, text, options }: TrackButtonParameters) => {
  return track({ instance: makeButtonContext({ id, text }), options });
};

type TrackElementParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackElement = ({ id, options }: TrackElementParameters) => {
  return track({ instance: makeSectionContext({ id }), options });
};

type TrackExpandableElementParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackExpandableElement = ({ id, options }: TrackExpandableElementParameters) => {
  return track({ instance: makeExpandableSectionContext({ id }), options });
};

type TrackInputParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackInput = ({ id, options }: TrackInputParameters) => {
  return track({ instance: makeInputContext({ id }), options });
};

type TrackLinkParameters = {
  id: string;
  text: string;
  href: string;
  options?: TrackOptions;
};
export const trackLink = ({ id, text, href, options }: TrackLinkParameters) => {
  return track({ instance: makeLinkContext({ id, text, href }), options });
};

type TrackMediaPlayerParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackMediaPlayer = ({ id, options }: TrackMediaPlayerParameters) => {
  return track({ instance: makeMediaPlayerContext({ id }), options });
};

type TrackNavigationParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackNavigation = ({ id, options }: TrackNavigationParameters) => {
  return track({ instance: makeNavigationContext({ id }), options });
};

type TrackOverlayParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackOverlay = ({ id, options }: TrackOverlayParameters) => {
  return track({ instance: makeOverlayContext({ id }), options });
};

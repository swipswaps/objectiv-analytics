import { cleanObjectFromDiscriminatingProperties, } from '@objectiv/tracker-core';
import { v4 as uuidv4 } from 'uuid';
import { z } from "zod";
import { ClickableContext, InputContext, LocationContext, SectionContext } from '../Contexts';
import {
  ElementTrackingAttribute,
  StringifiedElementTrackingAttributes,
  TrackingAttributeVisibility,
} from '../TrackingAttributes';

/**
 * Used to decorate a Trackable Element with our Tracking Attributes.
 *
 * Returns an object containing the tracking attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For a higher level api see the trackLocationHelpers module.
 *
 * Track Examples
 *
 *    track({ instance: makeElementContext({ id: 'section-id' }) })
 *    track({ instance: makeElementContext({ id: 'section-id' }), { trackClicks: true } })
 */
export const TrackOptions = z.object({
  trackClicks: z.boolean().optional(),
  trackBlurs: z.boolean().optional(),
  trackVisibility: TrackingAttributeVisibility.optional(),
  parentTracker: StringifiedElementTrackingAttributes.optional(),
});

export const TrackParameters = z.object({
  instance: LocationContext,
  options: TrackOptions.optional()
});

export const TrackFunction = z.function(
  z.tuple([TrackParameters]),
  StringifiedElementTrackingAttributes
);

export const trackLocation = TrackFunction.validate(({ instance, options }) => {
  const elementId = uuidv4();

  // Process options. Gather default attribute values
  let trackClicks = ClickableContext.safeParse(instance).success ? true : undefined;
  let trackBlurs = InputContext.safeParse(instance).success ? true : undefined;
  let trackVisibility = SectionContext.safeParse(instance).success ? { mode: 'auto' } : undefined;
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

  // Clean up the instance from discriminatory properties before serializing it
  cleanObjectFromDiscriminatingProperties(instance);

  return {
    [ElementTrackingAttribute.elementId]: elementId,
    [ElementTrackingAttribute.parentElementId]: parentElementId,
    [ElementTrackingAttribute.context]: JSON.stringify(instance),
    [ElementTrackingAttribute.trackClicks]: JSON.stringify(trackClicks),
    [ElementTrackingAttribute.trackBlurs]: JSON.stringify(trackBlurs),
    [ElementTrackingAttribute.trackVisibility]: JSON.stringify(trackVisibility),
  };
})

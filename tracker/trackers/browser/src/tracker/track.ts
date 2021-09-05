import { cleanObjectFromDiscriminatingProperties } from '@objectiv/tracker-core';
import { boolean, create, func, Infer, is, literal, object, optional, union } from 'superstruct';
import { v4 as uuidv4 } from 'uuid';
import { ClickableContext, InputContext, LocationContext, SectionContext } from '../Contexts';
import { isEmptyObject } from '../isEmptyObject';
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
 * For a higher level api see the trackHelpers module.
 *
 * Track Examples
 *
 *    track({ instance: makeElementContext({ id: 'section-id' }) })
 *    track({ instance: makeElementContext({ id: 'section-id' }), { trackClicks: true } })
 */

export const TrackReturnValue = union([StringifiedElementTrackingAttributes, literal({})]);
export type TrackReturnValue = Infer<typeof TrackReturnValue>;

export const TrackOptions = object({
  trackClicks: optional(boolean()),
  trackBlurs: optional(boolean()),
  trackVisibility: optional(TrackingAttributeVisibility),
  parentTracker: optional(TrackReturnValue),
});

export const TrackParameters = object({
  instance: LocationContext,
  options: optional(TrackOptions),
  onError: optional(func()),
});
export type TrackParameters = Infer<typeof TrackParameters> & {
  onError?: (error: Error, parameters: TrackParameters) => void;
};

export const track = (parameters: TrackParameters): TrackReturnValue => {
  try {
    const { instance, options } = create(parameters, TrackParameters);
    const elementId = uuidv4();

    // TODO try to embed this whole defaulting block into the type itself using coercion
    // Process options. Gather default attribute values
    let trackClicks = is(instance, ClickableContext) ? true : undefined;
    let trackBlurs = is(instance, InputContext) ? true : undefined;
    let trackVisibility = is(instance, SectionContext) ? { mode: 'auto' } : undefined;
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
      if (options.parentTracker !== undefined && !isEmptyObject(options.parentTracker)) {
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
  } catch (error) {
    if (parameters?.onError) {
      parameters.onError(error, parameters);
    } else {
      console.error(error, parameters);
    }
    return {};
  }
};

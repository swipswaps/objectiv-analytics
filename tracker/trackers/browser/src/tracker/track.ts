import { boolean, create, func, Infer, is, object, optional } from 'superstruct';
import { ClickableContext, InputContext, LocationContext, SectionContext, stringifyLocationContext } from '../Contexts';
import { StringifiedTrackingAttributes, TrackingAttribute, TrackingAttributeVisibility } from '../TrackingAttributes';
import { trackErrorHandler, TrackOnErrorCallback } from './trackErrorHandler';

/**
 * Used to decorate a Trackable Element with our Tracking Attributes.
 *
 * Returns an object containing the tracking attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For a higher level api see the trackHelpers module.
 *
 * Examples
 *
 *    track({ instance: makeElementContext({ id: 'section-id' }) })
 *    track({ instance: makeElementContext({ id: 'section-id' }), { trackClicks: true } })
 *
 */
export const TrackReturnValue = optional(StringifiedTrackingAttributes);
export type TrackReturnValue = Infer<typeof TrackReturnValue>;

export const TrackOptions = object({
  trackClicks: optional(boolean()),
  trackBlurs: optional(boolean()),
  trackVisibility: optional(TrackingAttributeVisibility),
  parentTracker: optional(TrackReturnValue),
});
export type TrackOptions = Infer<typeof TrackOptions>;

export const TrackParameters = object({
  instance: LocationContext,
  options: optional(TrackOptions),
  onError: optional(func()),
});
export type TrackParameters = {
  instance: Infer<typeof LocationContext>;
  options?: TrackOptions;
  onError?: TrackOnErrorCallback;
};

export const track = (parameters: TrackParameters): TrackReturnValue => {
  try {
    // Validate input
    const { instance, options } = create(parameters, TrackParameters);

    // Process options. Gather default attribute values
    const trackClicks = options?.trackClicks ?? (is(instance, ClickableContext) ? true : undefined);
    const trackBlurs = options?.trackBlurs ?? (is(instance, InputContext) ? true : undefined);
    const trackVisibility = options?.trackVisibility ?? (is(instance, SectionContext) ? { mode: 'auto' } : undefined);
    const parentElementId = options?.parentTracker ? options.parentTracker[TrackingAttribute.elementId] : undefined;

    // Validate output and return it
    return create(
      {
        [TrackingAttribute.parentElementId]: parentElementId,
        [TrackingAttribute.context]: stringifyLocationContext(instance),
        [TrackingAttribute.trackClicks]: JSON.stringify(trackClicks),
        [TrackingAttribute.trackBlurs]: JSON.stringify(trackBlurs),
        [TrackingAttribute.trackVisibility]: JSON.stringify(trackVisibility),
      },
      StringifiedTrackingAttributes
    );
  } catch (error) {
    return trackErrorHandler(error, parameters, parameters?.onError);
  }
};

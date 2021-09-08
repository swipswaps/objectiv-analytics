import { array, assert, assign, create, Infer, object, optional, union } from 'superstruct';
import {
  StringifiedChildrenTrackingAttributes,
  StringifiedTrackingAttributes,
  TrackChildrenQueryAll,
  TrackChildrenQueryOne,
  TrackingAttribute,
} from '../TrackingAttributes';
import { trackerErrorHandler, TrackOnErrorCallback } from './trackerErrorHandler';

/**
 * Used to decorate a Trackable Element with our Children Tracking Attributes.
 *
 * Returns an object containing the children tracking attribute only.
 * This attribute is a serialized list of TrackChildrenQuery objects and will be parsed and executed by our Observer
 * as soon as the elements gets rendered.
 *
 * Examples
 *
 *    trackChildren([
 *      {
 *        queryAll: 'button[aria-label="Previous"]',
 *        trackAs: trackButton({ id: 'prev', text: 'Previous' })
 *      },
 *      {
 *        queryAll: 'button[aria-label="Next"]',
 *        trackAs: trackButton({ id: 'next', text: 'Next' })
 *      }
 *    ])
 *
 *    trackChildren([
 *      {
 *        query: '#button1',
 *        trackAs: trackButton({ id: 'button1', text: 'Button 1' })
 *      },
 *      {
 *        query: '#button2',
 *        trackAs: trackButton({ id: 'button2', text: 'Button 2' })
 *      },
 *    ])
 *
 */
const TrackAsParameter = object({
  trackAs: optional(StringifiedTrackingAttributes),
});

export const TrackChildrenQueryOneParameters = assign(TrackChildrenQueryOne, TrackAsParameter);
export const TrackChildrenQueryAllParameters = assign(TrackChildrenQueryAll, TrackAsParameter);
export const TrackChildParameters = union([TrackChildrenQueryOneParameters, TrackChildrenQueryAllParameters]);
export type TrackChildParameters = Infer<typeof TrackChildParameters>;
export const TrackChildrenParameters = array(TrackChildParameters);
export type TrackChildrenParameters = Infer<typeof TrackChildrenParameters>;

export const TrackChildrenReturnValue = optional(StringifiedChildrenTrackingAttributes);
export type TrackChildrenReturnValue = Infer<typeof TrackChildrenReturnValue>;

export const trackChildren = (
  parameters: TrackChildrenParameters,
  onError?: TrackOnErrorCallback
): TrackChildrenReturnValue => {
  try {
    // Validate input
    assert(parameters, TrackChildrenParameters);

    // Validate output and return it
    return create(
      {
        [TrackingAttribute.trackChildren]: JSON.stringify(parameters),
      },
      StringifiedChildrenTrackingAttributes
    );
  } catch (error) {
    return trackerErrorHandler(error, parameters, onError);
  }
};

/**
 * Syntactic sugar to track only one child.
 *
 * Examples
 *
 *    trackChild({
 *      query: '#button1',
 *      trackAs: trackButton({ id: 'button1', text: 'Button 1' })
 *    })
 *
 *    trackChild({
 *      query: '#button2',
 *      trackAs: trackButton({ id: 'button2', text: 'Button 2' })
 *    })
 *
 */
export const trackChild = (parameters: TrackChildParameters, onError?: TrackOnErrorCallback) => {
  return trackChildren([parameters], onError);
};

import { ChildrenTrackingAttributes, StringifiedTrackingAttributes, TrackingAttribute } from '../TrackingAttributes';

/**
 * The parameters of `trackChildren`
 */
export type TrackChildrenQuery = {
  query: string;
  queryAll?: undefined;
};

export type TrackChildrenQueryAll = {
  query?: undefined;
  queryAll: string;
};

export type TrackChildrenParameters = (TrackChildrenQuery | TrackChildrenQueryAll) & {
  trackAs: StringifiedTrackingAttributes | undefined;
};

export type TrackChildrenReturnValue = ChildrenTrackingAttributes | {};

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
export const trackChildren = (childrenParameters: TrackChildrenParameters[]): TrackChildrenReturnValue => {
  // TODO Debuggability: Validate that trackAs is actually valued?
  return {
    [TrackingAttribute.trackChildren]: JSON.stringify(childrenParameters),
  };
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
export const trackChild = (childParameters: TrackChildrenParameters) => trackChildren([childParameters]);

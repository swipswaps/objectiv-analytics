import {
  ChildrenTrackingAttribute,
  ChildrenTrackingAttributes,
  ElementTrackingAttributes,
} from '../TrackingAttributes';

/**
 * The parameters of `trackChildren`
 */
export type TrackChildrenParameters = {
  query: string;
  trackAs: ElementTrackingAttributes;
};

export type TrackChildrenReturnValue = ChildrenTrackingAttributes | {};

/**
 * Used to decorate a Trackable Element with our Children Tracking Attributes.
 * TODO better docs
 */
export const trackChildren = (parameters: TrackChildrenParameters[]): TrackChildrenReturnValue => {
  return {
    [ChildrenTrackingAttribute.queries]: JSON.stringify(parameters),
  };
};

export const trackChild = (parameters: TrackChildrenParameters) => trackChildren([parameters]);

// {...trackChild({ query: 'button[aria-label="Previous"], trackAs: trackButton({id: 'prev', text: 'Previous'}) }}
//
// {...trackChildren([
//   { query: 'button[aria-label="Previous"], trackAs: trackButton({id: 'prev', text: 'Previous'}) },
//   { query: 'button[aria-label="Next"], trackAs: trackButton({id: 'next', text: 'Next'}) },
// ])}
//

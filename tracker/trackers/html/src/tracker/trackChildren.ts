import {
  ChildrenTrackingAttribute,
  ChildrenTrackingAttributes,
  StringifiedElementTrackingAttributes,
} from '../TrackingAttributes';

/**
 * The parameters of `trackChildren`
 */
export type TrackChildrenParameters = {
  query: string;
  trackAs: StringifiedElementTrackingAttributes;
};

export type TrackChildrenReturnValue = ChildrenTrackingAttributes | {};

/**
 * Used to decorate a Trackable Element with our Children Tracking Attributes.
 * TODO better docs
 */
export const trackChildren = (childrenParameters: TrackChildrenParameters[]): TrackChildrenReturnValue => {
  return {
    [ChildrenTrackingAttribute.queries]: JSON.stringify(childrenParameters),
  };
};

export const trackChild = (childParameters: TrackChildrenParameters) => trackChildren([childParameters]);

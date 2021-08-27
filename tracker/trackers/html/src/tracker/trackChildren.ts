import {
  ChildrenTrackingAttribute,
  ChildrenTrackingAttributes,
  StringifiedElementTrackingAttributes,
} from '../TrackingAttributes';

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
  trackAs: StringifiedElementTrackingAttributes | {};
};

export type TrackChildrenReturnValue = ChildrenTrackingAttributes | {};

/**
 * Used to decorate a Trackable Element with our Children Tracking Attributes.
 * TODO better docs
 */
export const trackChildren = (childrenParameters: TrackChildrenParameters[]): TrackChildrenReturnValue => {
  // TODO Debuggability: Validate that trackAs is actually valued?
  return {
    [ChildrenTrackingAttribute.trackChildren]: JSON.stringify(childrenParameters),
  };
};

export const trackChild = (childParameters: TrackChildrenParameters) => trackChildren([childParameters]);

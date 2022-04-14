/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AnyLocationContext, AnyShowableContext } from '../../definitions/LocationContext';

/**
 * A type guard to determine if the given LocationContext supports HiddenEvent and VisibleEvent.
 */
export const isShowableContext = (locationContext: AnyLocationContext): locationContext is AnyShowableContext =>
  // FIXME restrict AbstractLocationContext._type to LocationContextName
  // then this can be replaced by
  // return Object.values(LocationContextName).includes(locationContext._type);
  ['OverlayContext', 'ExpandableContext'].includes(locationContext._type);

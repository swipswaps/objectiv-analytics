/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AnyLocationContext, AnyShowableContext } from '../../definitions/LocationContext';

/**
 * A type guard to determine if the given LocationContext supports HiddenEvent and VisibleEvent.
 */
export const isShowableContext = (locationContext: AnyLocationContext): locationContext is AnyShowableContext =>
  ['OverlayContext', 'ExpandableContext'].includes(locationContext._type);

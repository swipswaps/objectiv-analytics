/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { AnyLocationContext } from '../../definitions/LocationContext';

/**
 * A type guard to determine if the given object is a LocationContext.
 */
export const isLocationContext = (locationContext: AbstractLocationContext): locationContext is AnyLocationContext => {
  if (!locationContext?._type) {
    throw new Error('LocationContext is missing the `_type` attribute');
  }

  if (!locationContext?.id) {
    throw new Error('LocationContext is missing the `id` attribute');
  }

  return [
    'ContentContext',
    'ExpandableContext',
    'InputContext',
    'LinkContext',
    'MediaPlayerContext',
    'NavigationContext',
    'OverlayContext',
    'PressableContext',
    'RootLocationContext',
  ].includes(locationContext._type);
};

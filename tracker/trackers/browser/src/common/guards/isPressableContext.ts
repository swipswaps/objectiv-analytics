/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AnyLocationContext, AnyPressableContext } from '../../definitions/LocationContext';

/**
 * A type guard to determine if the given LocationContext supports PressEvent.
 */
export const isPressableContext = (locationContext: AnyLocationContext): locationContext is AnyPressableContext =>
  // FIXME restrict AbstractLocationContext._type to LocationContextName
  // then this can be replaced by
  // return Object.values(LocationContextName).includes(locationContext._type);
  ['PressableContext', 'LinkContext'].includes(locationContext._type);

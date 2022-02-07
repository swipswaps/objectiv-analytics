/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AnyClickableContext, AnyLocationContext } from '../../definitions/LocationContext';

/**
 * A type guard to determine if the given LocationContext supports PressEvent.
 */
export const isClickableContext = (locationContext: AnyLocationContext): locationContext is AnyClickableContext =>
  ['PressableContext', 'LinkContext', 'ExpandableContext'].includes(locationContext._type);

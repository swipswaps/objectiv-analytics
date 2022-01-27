/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TagLocationReturnValue } from './TagLocationReturnValue';
import { TrackClicksAttribute } from './TrackClicksAttribute';
import { TrackVisibilityAttribute } from './TrackVisibilityAttribute';
import { ValidateAttribute } from './ValidateAttribute';

/**
 * The options object that tagLocation and its shorthands accept
 */
export type TagLocationOptions = {
  trackClicks?: TrackClicksAttribute;
  trackBlurs?: boolean;
  trackVisibility?: TrackVisibilityAttribute;
  parent?: TagLocationReturnValue;
  validate?: ValidateAttribute;
};

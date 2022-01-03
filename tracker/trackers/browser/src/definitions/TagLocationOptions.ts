/*
 * Copyright 2022 Objectiv B.V.
 */

import { boolean, object, optional } from 'superstruct';
import { TagLocationReturnValue } from './TagLocationReturnValue';
import { TrackClicksAttribute } from './TrackClicksAttribute';
import { TrackVisibilityAttribute } from './TrackVisibilityAttribute';
import { ValidateAttribute } from './ValidateAttribute';

/**
 * The options object that tagLocation and its shorthands accept
 */
export const TagLocationOptions = object({
  trackClicks: optional(TrackClicksAttribute),
  trackBlurs: optional(boolean()),
  trackVisibility: optional(TrackVisibilityAttribute),
  parent: TagLocationReturnValue,
  validate: optional(ValidateAttribute),
});

export type TagLocationOptions = {
  trackClicks?: TrackClicksAttribute;
  trackBlurs?: boolean;
  trackVisibility?: TrackVisibilityAttribute;
  parent?: TagLocationReturnValue;
  validate?: ValidateAttribute;
};

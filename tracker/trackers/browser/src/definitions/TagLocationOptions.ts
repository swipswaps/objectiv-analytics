import { boolean, object, optional } from 'superstruct';
import { TrackClicksAttribute, TrackVisibilityAttribute, ValidateAttribute } from './TaggingAttributes';
import { TagLocationReturnValue } from './TagLocationReturnValue';

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

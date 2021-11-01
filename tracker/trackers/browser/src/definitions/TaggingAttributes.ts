import { boolean, Infer, object, optional } from 'superstruct';
import { AnyLocationContext } from './LocationContext';
import { TaggingAttribute } from './TaggingAttribute';
import { TrackClicksAttribute } from './TrackClicksAttribute';
import { TrackVisibilityAttribute } from './TrackVisibilityAttribute';
import { Uuid } from './uuid';
import { ValidateAttribute } from './ValidateAttribute';

/**
 * FIXME get rid of this
 * The object that Location Taggers return
 */
export const TaggingAttributes = object({
  [TaggingAttribute.elementId]: Uuid,
  [TaggingAttribute.parentElementId]: optional(Uuid),
  [TaggingAttribute.context]: AnyLocationContext,
  [TaggingAttribute.trackClicks]: optional(TrackClicksAttribute),
  [TaggingAttribute.trackBlurs]: optional(boolean()),
  [TaggingAttribute.trackVisibility]: optional(TrackVisibilityAttribute),
  [TaggingAttribute.validate]: optional(ValidateAttribute),
});

export type TaggingAttributes = Infer<typeof TaggingAttributes>;

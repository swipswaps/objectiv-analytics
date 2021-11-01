import { boolean, defaulted, Infer, literal, number, object, optional, string, union } from 'superstruct';
import { jsonParse, jsonStringify } from './json';
import { AnyLocationContext } from './LocationContext';
import { Uuid } from './uuid';
import { TaggingAttribute } from './TaggingAttribute';

/**
 * Custom Structs for the trackClicks Tagging Attribute + their Stringifier and Parser
 */
export const WaitUntilTrackedOptions = object({
  intervalMs: optional(number()),
  timeoutMs: optional(number()),
  flushQueue: optional(union([literal(false), literal(true), literal('onTimeout')])),
});
export type WaitUntilTrackedOptions = Infer<typeof WaitUntilTrackedOptions>;

export const TrackClicksAttribute = union([
  boolean(),
  object({
    waitUntilTracked: union([literal(true), WaitUntilTrackedOptions]),
  }),
]);
export type TrackClicksAttribute = Infer<typeof TrackClicksAttribute>;

export const stringifyTrackClicksAttribute = (trackClicksAttribute: TrackClicksAttribute) => {
  return jsonStringify(trackClicksAttribute, TrackClicksAttribute);
};

/**
 * TrackClicks Options Parser
 */
export const WaitForQueueOptions = union([
  object({
    intervalMs: optional(number()),
    timeoutMs: optional(number()),
  }),
]);
export type WaitForQueueOptions = Infer<typeof WaitForQueueOptions>;

export const FlushQueueOptions = union([literal(false), literal(true), literal('onTimeout')]);
export type FlushQueueOptions = Infer<typeof FlushQueueOptions>;

export const TrackClicksOptions = union([
  literal(undefined),
  object({
    waitForQueue: optional(WaitForQueueOptions),
    flushQueue: optional(FlushQueueOptions),
  }),
]);
export type TrackClicksOptions = Infer<typeof TrackClicksOptions>;

export const parseTrackClicksAttribute = (stringifiedTrackClicksAttribute: string | null): TrackClicksOptions => {
  const parsedTrackClicks = jsonParse(stringifiedTrackClicksAttribute, TrackClicksAttribute);

  // Process `true` and `false` shorthands onto their verbose options counterparts
  if (typeof parsedTrackClicks == 'boolean') {
    return parsedTrackClicks ? {} : undefined;
  }

  // Else it must be already an object, from here on trackClicks.enabled will always be `true`
  let trackClickOptions: TrackClicksOptions = {};
  const { waitUntilTracked } = parsedTrackClicks;

  // Process `waitUntilTracked` shorthands - we only have a `true` shorthands to process, `false` means no option
  if (typeof waitUntilTracked == 'boolean') {
    // An empty object means `waitForQueue` will use default internal values for both `timeoutMs` and `intervalMs`
    trackClickOptions.waitForQueue = {};
    // The default `flushQueue` value is to always flush
    trackClickOptions.flushQueue = true;
  } else {
    // waitUntilTracked must be an object
    const { flushQueue, ...waitForQueue } = waitUntilTracked;
    trackClickOptions.flushQueue = flushQueue !== undefined ? flushQueue : true;
    trackClickOptions.waitForQueue = waitForQueue;
  }

  return trackClickOptions;
};

/**
 * Custom Structs for the `trackVisibility` Tagging Attribute + their Stringifier and Parser
 */
export const TrackVisibilityAttributeAuto = object({ mode: literal('auto') });
export type TrackVisibilityAttributeAuto = Infer<typeof TrackVisibilityAttributeAuto>;
export const TrackVisibilityAttributeManual = object({ mode: literal('manual'), isVisible: boolean() });
export type TrackVisibilityAttributeManual = Infer<typeof TrackVisibilityAttributeManual>;
export const TrackVisibilityAttribute = union([TrackVisibilityAttributeAuto, TrackVisibilityAttributeManual]);
export type TrackVisibilityAttribute = Infer<typeof TrackVisibilityAttribute>;

export const stringifyTrackVisibilityAttribute = (trackVisibilityAttribute: TrackVisibilityAttribute) => {
  if (!(typeof trackVisibilityAttribute === 'object')) {
    throw new Error(`trackVisibility must be an object, received: ${JSON.stringify(trackVisibilityAttribute)}`);
  }
  return jsonStringify(trackVisibilityAttribute, TrackVisibilityAttribute);
};

export const parseTrackVisibilityAttribute = (stringifiedTrackVisibilityAttribute: string | null) => {
  return jsonParse(stringifiedTrackVisibilityAttribute, TrackVisibilityAttribute);
};

/**
 * Custom Struct for the `validate` Tagging Attribute + their Stringifier and Parser
 */
export const ValidateAttribute = object({
  locationUniqueness: defaulted(boolean(), true),
});
export type ValidateAttribute = Infer<typeof ValidateAttribute>;

export const stringifyValidateAttribute = (validateAttribute: ValidateAttribute) => {
  if (!(typeof validateAttribute === 'object')) {
    throw new Error(`validate Attribute must be an object, received: ${JSON.stringify(validateAttribute)}`);
  }
  return jsonStringify(validateAttribute, ValidateAttribute);
};

export const parseValidateAttribute = (stringifiedValidateAttribute: string | null) => {
  return jsonParse(stringifiedValidateAttribute ?? '{}', ValidateAttribute);
};

/**
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

/**
 * The object that Location Taggers return, stringified
 */
export const StringifiedTaggingAttributes = object({
  [TaggingAttribute.elementId]: Uuid,
  [TaggingAttribute.parentElementId]: optional(Uuid),
  [TaggingAttribute.context]: string(),
  [TaggingAttribute.trackClicks]: optional(string()),
  [TaggingAttribute.trackBlurs]: optional(string()),
  [TaggingAttribute.trackVisibility]: optional(string()),
  [TaggingAttribute.validate]: optional(string()),
});
export type StringifiedTaggingAttributes = Infer<typeof StringifiedTaggingAttributes>;

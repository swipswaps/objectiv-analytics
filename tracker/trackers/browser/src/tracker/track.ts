import { cleanObjectFromDiscriminatingProperties } from '@objectiv/tracker-core';
import { assert, boolean, enums, Infer, literal, object, optional, record, string, union, unknown } from 'superstruct';
import { v4 as uuidv4 } from 'uuid';
import { AbstractLocationContext } from '../';
import {
  ContextType,
  ContextTypes,
  TrackBlursDefaultValueByContextType,
  TrackClicksDefaultValueByContextType,
  TrackVisibilityDefaultValueByContextType,
} from '../ContextType';
import {
  ElementTrackingAttribute,
  StringifiedElementTrackingAttributes,
  TrackingAttributeVisibility,
} from '../TrackingAttributes';

/**
 * The options parameter of the `track` function. Used to override default behavior
 */
export const TrackOptions = object({
  trackClicks: optional(boolean()),
  trackBlurs: optional(boolean()),
  trackVisibility: optional(TrackingAttributeVisibility),
  parentTracker: optional(StringifiedElementTrackingAttributes),
});
export type TrackOptions = Infer<typeof TrackOptions>;

/**
 * The extraAttributes parameter of the `track` function
 */
export const TrackExtraAttributes = record(string(), unknown());
export type TrackExtraAttributes = Infer<typeof TrackExtraAttributes>;

export const TrackButtonExtraAttributes = object({ text: string() });
export type TrackButtonExtraAttributes = Infer<typeof TrackButtonExtraAttributes>;

export const TrackLinkExtraAttributes = object({ text: string(), href: string() });
export type TrackLinkExtraAttributes = Infer<typeof TrackLinkExtraAttributes>;

/**
 * All the possible parameters combination of `track`
 */
export const TrackParameters = union([
  object({
    id: string(),
    type: optional(
      // Exclude Link and Button, as they enforce attributes with their own definitions below
      enums(ContextTypes.filter((contextType) => ![ContextType.button, ContextType.link].includes(contextType)))
    ),
    extraAttributes: optional(TrackExtraAttributes),
    options: optional(TrackOptions),
  }),
  // Button
  object({
    id: string(),
    type: literal(ContextType.button),
    extraAttributes: TrackButtonExtraAttributes,
    options: optional(TrackOptions),
  }),
  // Link
  object({
    id: string(),
    type: literal(ContextType.link),
    extraAttributes: TrackLinkExtraAttributes,
    options: optional(TrackOptions),
  }),
]);
export type TrackParameters = Infer<typeof TrackParameters>;

export type TrackReturnValue = StringifiedElementTrackingAttributes;

/**
 * Used to decorate a Trackable Element with our Tracking Attributes. Can be called in three ways:
 *
 *    trackElement(<id>)
 *    trackElement(<id>, <ContextType>, <extraAttributes object>, <options object>)
 *
 * Examples
 *
 *    trackElement('section id')
 *    trackElement('button', ContextType.button, { text: 'Click Me' }, { trackClicks: true })
 *
 * Returns an object containing the tracking attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For most commonly used Elements / Location Contexts see also the helper functions below.
 */

// Overload: Default behavior
export function track(parameters: TrackParameters): TrackReturnValue;

// Overload: Button context - When `type` is ContextType.button enforce `text` extraAttribute
export function track(parameters: {
  id: string;
  type: ContextType.button;
  extraAttributes: TrackButtonExtraAttributes;
  options?: TrackOptions;
}): TrackReturnValue;

// Overload: Button context - When `type` is ContextType.link enforce `text` and `href` extraAttributes
export function track(parameters: {
  id: string;
  type: ContextType.link;
  extraAttributes: TrackLinkExtraAttributes;
  options?: TrackOptions;
}): TrackReturnValue;

// Implementation
export function track(parameters: TrackParameters): TrackReturnValue {
  assert(parameters, TrackParameters);
  const { id, type = ContextType.element, extraAttributes, options } = parameters;
  const elementId = uuidv4();

  // Factor context instance if necessary
  // TODO Surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
  const contextInstance: AbstractLocationContext = {
    __location_context: true,
    _context_type: type,
    id: id,
    ...extraAttributes,
  };

  // Clean up the instance from discriminatory properties
  cleanObjectFromDiscriminatingProperties(contextInstance);

  // Get the current _context_type from the instance
  const contextType = contextInstance._context_type as ContextType;

  // Process options. Gather default attribute values
  let trackClicks = TrackClicksDefaultValueByContextType.get(contextType);
  let trackBlurs = TrackBlursDefaultValueByContextType.get(contextType);
  let trackVisibility = TrackVisibilityDefaultValueByContextType.get(contextType);
  let parentElementId = undefined;

  // Process options and apply overrides, if any
  if (options !== undefined) {
    assert(options, TrackOptions);

    if (options.trackClicks !== undefined) {
      trackClicks = options.trackClicks;
    }
    if (options.trackBlurs !== undefined) {
      trackBlurs = options.trackBlurs;
    }
    if (options.trackVisibility !== undefined) {
      trackVisibility = options.trackVisibility;
    }
    if (options.parentTracker !== undefined) {
      assert(options.parentTracker, StringifiedElementTrackingAttributes);
      parentElementId = options.parentTracker[ElementTrackingAttribute.elementId];
    }
  }

  return {
    [ElementTrackingAttribute.elementId]: elementId,
    [ElementTrackingAttribute.parentElementId]: parentElementId,
    [ElementTrackingAttribute.context]: JSON.stringify(contextInstance),
    [ElementTrackingAttribute.trackClicks]: JSON.stringify(trackClicks),
    [ElementTrackingAttribute.trackBlurs]: JSON.stringify(trackBlurs),
    [ElementTrackingAttribute.trackVisibility]: JSON.stringify(trackVisibility),
  };
}

/**
 * Location Context specific helpers. To make it easier to track common HTML Elements
 */
type TrackButtonParameters = {
  id: string;
  text: string;
  options?: TrackOptions;
};
export const trackButton = ({ id, text, options }: TrackButtonParameters) => {
  return track({ id, type: ContextType.button, extraAttributes: { text }, options });
};

type TrackElementParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackElement = ({ id, options }: TrackElementParameters) => {
  return track({ id, type: ContextType.element, options });
};

type TrackExpandableElementParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackExpandableElement = ({ id, options }: TrackExpandableElementParameters) => {
  return track({ id, type: ContextType.expandableElement, options });
};

type TrackInputParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackInput = ({ id, options }: TrackInputParameters) => {
  return track({ id, type: ContextType.input, options });
};

type TrackLinkParameters = {
  id: string;
  text: string;
  href: string;
  options?: TrackOptions;
};
export const trackLink = ({ id, text, href, options }: TrackLinkParameters) => {
  return track({ id, type: ContextType.link, extraAttributes: { text, href }, options });
};

type TrackMediaPlayerParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackMediaPlayer = ({ id, options }: TrackMediaPlayerParameters) => {
  return track({ id, type: ContextType.mediaPlayer, options });
};

type TrackNavigationParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackNavigation = ({ id, options }: TrackNavigationParameters) => {
  return track({ id, type: ContextType.navigation, options });
};

type TrackOverlayParameters = {
  id: string;
  options?: TrackOptions;
};
export const trackOverlay = ({ id, options }: TrackOverlayParameters) => {
  return track({ id, type: ContextType.overlay, options });
};

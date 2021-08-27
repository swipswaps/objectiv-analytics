import { AbstractLocationContext } from '@objectiv/schema';
import { cleanObjectFromDiscriminatingProperties } from '@objectiv/tracker-web';
import { v4 as uuidv4 } from 'uuid';
import {
  ContextType,
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
 * It's possible to call `track` with just an ID for SectionContexts aka Elements
 */
export const DEFAULT_CONTEXT_TYPE = ContextType.element;

/**
 * The options parameter of the `track` function. Used to override default behavior
 */
export type TrackParameterOptions = {
  trackClicks?: boolean;
  trackBlurs?: boolean;
  trackVisibility?: TrackingAttributeVisibility;
  parentTracker?: StringifiedElementTrackingAttributes | {};
};

/**
 * The parameters of `track`
 */
export type TrackParameters = {
  id?: string;
  instance?: AbstractLocationContext;
  type?: ContextType;
  extraAttributes?: Record<string, any>;
  options?: TrackParameterOptions;
};

export type TrackReturnValue = StringifiedElementTrackingAttributes | {};

/**
 * Used to decorate a Trackable Element with our Tracking Attributes. Can be called in three ways:
 *
 *    trackElement(<id>)
 *    trackElement(<id>, <ContextType>, <extraAttributes object>)
 *    trackElement(<Context Instance>)
 *
 * Examples
 *
 *    trackElement('section id')
 *    trackElement('button', ContextType.button, { text: 'Click Me' })
 *    trackElement(makeButtonContext({ id: 'button', text: 'Click Me' }))
 *
 * Returns an object containing the tracking attributes. It's properties are supposed to be spread on the target HTML
 * Element. This allows us to identify elements uniquely in a Document and to reconstruct their Location.
 *
 * For most commonly used Elements / Location Contexts see also the helper functions below.
 */

// Overload: Section context by id only
export function track(parameters: { id: string; options?: TrackParameterOptions }): TrackReturnValue;

// Overload: Location contexts without attributes
export function track(parameters: {
  id: string;
  type:
    | ContextType.element
    | ContextType.input
    | ContextType.mediaPlayer
    | ContextType.navigation
    | ContextType.overlay;
  options?: TrackParameterOptions;
}): TrackReturnValue;

// Overload: Section contexts with visibility
export function track(parameters: {
  id: string;
  type:
    | ContextType.element
    | ContextType.expandableElement
    | ContextType.mediaPlayer
    | ContextType.navigation
    | ContextType.overlay;
  options?: TrackParameterOptions;
}): TrackReturnValue;

// Overload: Button context
export function track(parameters: {
  id: string;
  type: ContextType.button;
  extraAttributes: { text: string };
  options?: TrackParameterOptions;
}): TrackReturnValue;

// Overload: Link context
export function track(parameters: {
  id: string;
  type: ContextType.link;
  extraAttributes: { href: string; text: string };
  options?: TrackParameterOptions;
}): TrackReturnValue;

// Overload: Any Location Context
export function track(parameters: {
  instance: AbstractLocationContext;
  options?: TrackParameterOptions;
}): TrackReturnValue;

// Implementation
export function track({ id, instance, type, extraAttributes, options }: TrackParameters): TrackReturnValue {
  const elementId = uuidv4();

  // This can happen when feeding dynamic parameters to track. Eg: search or database results.
  if ((!id && !instance) || (id && instance)) {
    console.group('track: Unexpected input');
    console.log(`id: ${id}`);
    console.log(`instance: ${id}`);
    console.log(`type: ${type}`);
    console.log(`extraAttributes: ${JSON.stringify(extraAttributes)}`);
    console.log(`options: ${JSON.stringify(options)}`);
    console.groupEnd();
    return {};
  }

  // Factor context instance if necessary
  let contextInstance: AbstractLocationContext | undefined;
  if (id) {
    // TODO Surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
    contextInstance = {
      __location_context: true,
      _context_type: type ?? DEFAULT_CONTEXT_TYPE,
      id: id,
      ...extraAttributes,
    };
  } else {
    contextInstance = instance;
  }

  if (!contextInstance) {
    return {};
  }

  // Clean up the instance from discriminatory properties
  cleanObjectFromDiscriminatingProperties(contextInstance);

  // Get the current _context_type from the instance
  const contextType = contextInstance._context_type as ContextType;

  // Gather default attribute values
  let trackClicks = TrackClicksDefaultValueByContextType.get(contextType);
  let trackBlurs = TrackBlursDefaultValueByContextType.get(contextType);
  let trackVisibility = TrackVisibilityDefaultValueByContextType.get(contextType);

  // Process options and apply overrides, if any
  if (options !== undefined) {
    if (options.trackClicks !== undefined) {
      trackClicks = options.trackClicks;
    }
    if (options.trackBlurs !== undefined) {
      trackClicks = options.trackBlurs;
    }
    if (options.trackVisibility !== undefined) {
      trackVisibility = options.trackVisibility;
    }
  }

  // Process parent tracker option and extract the Parent tracker Element Id attribute
  let parentElementId = undefined;
  if (options && options.parentTracker) {
    if (options.parentTracker !== {}) {
      const parentTrackerAttributes = options.parentTracker as StringifiedElementTrackingAttributes;
      parentElementId = parentTrackerAttributes[ElementTrackingAttribute.elementId];
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
  options?: TrackParameterOptions;
};
export const trackButton = ({ id, text, options }: TrackButtonParameters) => {
  return track({ id, type: ContextType.button, extraAttributes: { text }, options });
};

type TrackElementParameters = {
  id: string;
  options?: TrackParameterOptions;
};
export const trackElement = ({ id, options }: TrackElementParameters) => {
  return track({ id, type: ContextType.element, options });
};

type TrackExpandableElementParameters = {
  id: string;
  options?: TrackParameterOptions;
};
export const trackExpandableElement = ({ id, options }: TrackExpandableElementParameters) => {
  return track({ id, type: ContextType.expandableElement, options });
};

type TrackInputParameters = {
  id: string;
  options?: TrackParameterOptions;
};
export const trackInput = ({ id, options }: TrackInputParameters) => {
  return track({ id, type: ContextType.input, options });
};

type TrackLinkParameters = {
  id: string;
  text: string;
  href: string;
  options?: TrackParameterOptions;
};
export const trackLink = ({ id, text, href, options }: TrackLinkParameters) => {
  return track({ id, type: ContextType.link, extraAttributes: { text, href }, options });
};

type TrackMediaPlayerParameters = {
  id: string;
  options?: TrackParameterOptions;
};
export const trackMediaPlayer = ({ id, options }: TrackMediaPlayerParameters) => {
  return track({ id, type: ContextType.mediaPlayer, options });
};

type TrackNavigationParameters = {
  id: string;
  options?: TrackParameterOptions;
};
export const trackNavigation = ({ id, options }: TrackNavigationParameters) => {
  return track({ id, type: ContextType.navigation, options });
};

type TrackOverlayParameters = {
  id: string;
  options?: TrackParameterOptions;
};
export const trackOverlay = ({ id, options }: TrackOverlayParameters) => {
  return track({ id, type: ContextType.overlay, options });
};

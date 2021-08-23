import { AbstractLocationContext } from '@objectiv/schema';
import { cleanObjectFromDiscriminatingProperties } from '@objectiv/tracker-web';
import { v4 as uuidv4 } from 'uuid';
import {
  BlurTrackingByContextType,
  ClickTrackingByContextType,
  ContextType,
  VisibilityTrackingByContextType,
} from './ContextType';
import {
  TrackingAttribute,
  TrackingAttributeFalse,
  TrackingAttributes,
  TrackingAttributeTrue,
  TrackingAttributeVisibility,
} from './TrackingAttributes';

/**
 * It's possible to call `trackElement` with just an ID for SectionContexts aka Elements
 */
export const DEFAULT_CONTEXT_TYPE = ContextType.element;

/**
 * The main endpoint of the HTML Tracker. Can be called in three ways:
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
 * For most commonly used Elements / Location Contexts see also the shortcut functions below.
 */

// Overload: Section context by id only
export function track(parameters: { id: string }): TrackingAttributes;

// Overload: Location contexts without attributes
export function track(parameters: {
  id: string;
  type:
    | ContextType.element
    | ContextType.input
    | ContextType.mediaPlayer
    | ContextType.navigation
    | ContextType.overlay;
}): TrackingAttributes;

// Overload: Section contexts with visibility
export function track(parameters: {
  id: string;
  type:
    | ContextType.element
    | ContextType.expandableElement
    | ContextType.mediaPlayer
    | ContextType.navigation
    | ContextType.overlay;
  isVisible?: boolean;
}): TrackingAttributes;

// Overload: Button context
export function track(parameters: {
  id: string;
  type: ContextType.button;
  extraAttributes: { text: string };
}): TrackingAttributes;

// Overload: Link context
export function track(parameters: {
  id: string;
  type: ContextType.link;
  extraAttributes: { href: string; text: string };
}): TrackingAttributes;

// Overload: Expandable Element context
export function track(parameters: {
  id: string;
  type: ContextType.expandableElement;
  extraAttributes: { text: string };
  isVisible?: boolean;
}): TrackingAttributes;

// Overload: Any Location Context
export function track(parameters: { instance: AbstractLocationContext }): TrackingAttributes;

// Implementation
export function track({
  id,
  instance,
  type,
  extraAttributes,
  isVisible,
}: {
  id?: string;
  instance?: AbstractLocationContext;
  type?: ContextType;
  extraAttributes?: Record<string, any>;
  isVisible?: boolean;
}): TrackingAttributes | {} {
  const elementId = uuidv4();

  // This can happen when feeding dynamic parameters to track. Eg: search or database results.
  if ((!id && !instance) || (id && instance)) {
    console.group('track: Unexpected input');
    console.log(`id: ${id}`);
    console.log(`instance: ${id}`);
    console.log(`type: ${type}`);
    console.log(`extraAttributes: ${JSON.stringify(extraAttributes)}`);
    console.log(`isVisible: ${isVisible}`);
    console.groupEnd();
    return {};
  }

  // Factor context instance if necessary
  let contextInstance;
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

  // Check if this context type allows for automatically tracking click events (eg: a button)
  const shouldTrackClicks = ClickTrackingByContextType.get(contextType);

  // Check if this context type allows for automatically tracking blur events (eg: an input)
  const shouldTrackBlurs = BlurTrackingByContextType.get(contextType);

  // Visibility can be tracked automatically, for certain contexts, programmatically for section contexts or not at all
  let trackVisibilityConfig: TrackingAttributeVisibility = undefined;

  // If we did not receive the `isVisible` parameter attempt to auto-track visibility, if the Context Type allows
  if (isVisible === undefined) {
    if (VisibilityTrackingByContextType.get(contextType)) {
      trackVisibilityConfig = { mode: 'auto' };
    }
  }
  // Else we will track whatever value we received as manual
  else {
    trackVisibilityConfig = { mode: 'manual', isVisible };
  }

  return {
    [TrackingAttribute.elementId]: elementId,
    [TrackingAttribute.context]: JSON.stringify(contextInstance),
    [TrackingAttribute.trackClicks]: shouldTrackClicks ? TrackingAttributeTrue : TrackingAttributeFalse,
    [TrackingAttribute.trackBlurs]: shouldTrackBlurs ? TrackingAttributeTrue : TrackingAttributeFalse,
    [TrackingAttribute.trackVisibility]: JSON.stringify(trackVisibilityConfig),
  };
}

/**
 * Location Context specific shortcuts. To make it easier to track common HTML Elements
 */
export const trackButton = ({ id, text }: { id: string; text: string }) => {
  return track({ id, type: ContextType.button, extraAttributes: { text } });
};

export const trackElement = ({ id, isVisible }: { id: string; isVisible?: boolean }) => {
  return track({ id, type: ContextType.element, isVisible });
};

export const trackExpandableElement = ({ id, text, isVisible }: { id: string; text: string, isVisible?: boolean }) => {
  return track({ id, type: ContextType.expandableElement, extraAttributes: { text }, isVisible });
};

export const trackInput = ({ id }: { id: string }) => {
  return track({ id, type: ContextType.input });
};

export const trackLink = ({ id, text, href }: { id: string; text: string; href: string }) => {
  return track({ id, type: ContextType.link, extraAttributes: { text, href } });
};

export const trackMediaPlayer = ({ id, isVisible }: { id: string; isVisible?: boolean }) => {
  return track({ id, type: ContextType.mediaPlayer, isVisible });
};

export const trackNavigation = ({ id, isVisible }: { id: string; isVisible?: boolean }) => {
  return track({ id, type: ContextType.navigation, isVisible });
};

export const trackOverlay = ({ id, isVisible }: { id: string; isVisible?: boolean }) => {
  return track({ id, type: ContextType.overlay, isVisible });
};

import { AbstractLocationContext } from '@objectiv/schema';
import { cleanObjectFromDiscriminatingProperties } from "@objectiv/tracker-core";
import superjson from 'superjson';
import { v4 as uuidv4 } from 'uuid';
import ContextType from './ContextType';

/**
 * All the attributes that are added to a DOM Element to make it trackable
 */
export enum TrackingAttribute {
  // A unique identifier used internally to pinpoint to a specific instance of a tracked element
  objectivElementId = 'data-objectiv-element-id',

  // A serialized instance of an Objectiv Context
  objectivContext = 'data-objectiv-context',
}

/**
 * The object that `trackElement` call return.
 */
type trackElementReturn = {
  [TrackingAttribute.objectivElementId]: string;
  [TrackingAttribute.objectivContext]: string;
};

/**
 * It's possible to call `trackElement` with just an ID for SectionContexts aka Elements
 */
const DEFAULT_CONTEXT_TYPE = ContextType.element;

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
export function track(id: string): trackElementReturn;

// Overload: Location contexts without attributes
export function track(
  id: string,
  type:
    | ContextType.element
    | ContextType.expandableElement
    | ContextType.input
    | ContextType.mediaPlayer
    | ContextType.navigation
    | ContextType.overlay
): trackElementReturn;

// Overload: Button context
export function track(id: string, type: ContextType.button, extraAttributes: { text: string }): trackElementReturn;

// Overload: Link context
export function track(
  id: string,
  type: ContextType.link,
  extraAttributes: { href: string; text: string }
): trackElementReturn;

// Overload: Any Location Context
export function track(instance: AbstractLocationContext): trackElementReturn;

// Implementation
export function track(
  idOrContextInstance: string | AbstractLocationContext,
  type?: ContextType,
  extraAttributes?: Record<string, any>
): trackElementReturn {
  const elementId = uuidv4();

  let contextInstance;
  if (typeof idOrContextInstance === 'string') {
    // TODO Surely nicer to use our factories for this. A wrapper around them, leveraging ContextType, should do.
    contextInstance = {
      __location_context: true,
      _context_type: type ?? DEFAULT_CONTEXT_TYPE,
      id: idOrContextInstance,
      ...extraAttributes,
    };
  } else {
    contextInstance = idOrContextInstance;
  }

  cleanObjectFromDiscriminatingProperties(contextInstance);

  return {
    [TrackingAttribute.objectivElementId]: elementId,
    [TrackingAttribute.objectivContext]: superjson.stringify(contextInstance),
  };
}

/**
 * Location Context specific shortcuts. To make it easier to track common HTML Elements
 */
export const trackButton = (id: string, text: string) => track(id, ContextType.button, { text });
export const trackElement = (id: string) => track(id, ContextType.element);
export const trackExpandableElement = (id: string) => track(id, ContextType.expandableElement);
export const trackInput = (id: string) => track(id, ContextType.input);
export const trackLink = (id: string, text: string, href: string) => track(id, ContextType.link, { text, href });
export const trackMediaPlayer = (id: string) => track(id, ContextType.mediaPlayer);
export const trackNavigation = (id: string) => track(id, ContextType.navigation);
export const trackOverlay = (id: string) => track(id, ContextType.overlay);

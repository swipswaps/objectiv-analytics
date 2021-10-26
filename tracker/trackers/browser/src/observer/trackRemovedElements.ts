import { TaggingAttribute } from '../TaggingAttribute';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackerErrorHandler } from '../trackerErrorHandler';
import { trackRemovedElement } from './trackRemovedElement';

/**
 * FIXME this docs are out of date
 * Given a Mutation Observer node containing removed nodes it will determine whether to track visibility:hidden events
 * Hidden Events are triggered only for automatically tracked Elements.
 */
export const trackRemovedElements = (element: Element, tracker: BrowserTracker) => {
  try {
    const elements = element.querySelectorAll(`[${TaggingAttribute.elementId}]`);
    [element, ...Array.from(elements)].forEach((element) => trackRemovedElement(element, tracker));
  } catch (error) {
    trackerErrorHandler(error);
  }
};

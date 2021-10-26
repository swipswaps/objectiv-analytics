import { LocationStack } from '@objectiv/tracker-core';
import { BrowserTracker, TaggableElement } from '../';
import { parseLocationContext } from '../structs';
import { TaggingAttribute } from '../TaggingAttribute';
import { trackerErrorHandler } from '../trackerErrorHandler';
import { isTaggableElement } from '../typeGuards';
import { findTaggedParentElements } from './findTaggedParentElements';

/**
 * 1. Traverses the DOM to reconstruct the component stack
 * 2. Retrieves the Tracker's Location Stack
 * 3. Merges the two Location Stacks to reconstruct the full Location
 */
export const getElementLocationStack = (parameters: {
  element: TaggableElement | EventTarget;
  tracker?: BrowserTracker;
}) => {
  const locationStack: LocationStack = [];

  try {
    const { element, tracker } = parameters;

    // Add Tracker's location to the locationStack
    if (tracker) {
      locationStack.push(...tracker.location_stack);
    }

    // Traverse the DOM to reconstruct Element's Location
    if (isTaggableElement(element)) {
      // Retrieve parent Tracked Elements
      const elementsStack = findTaggedParentElements(element).reverse();

      // Re-hydrate Location Stack
      elementsStack.forEach((element) => {
        // Get, parse, validate, hydrate and push Location Context in the Location Stack
        locationStack.push(parseLocationContext(element.getAttribute(TaggingAttribute.context)));
      });
    }
  } catch (error) {
    trackerErrorHandler(error, parameters);
  }

  return locationStack;
};

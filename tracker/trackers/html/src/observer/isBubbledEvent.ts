import { TrackingAttribute } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Checks if the given origin Tracked Element and the Event Target are the same Tracked Element.
 */
const isBubbledEvent = (originElement: Element, eventTarget: EventTarget): boolean => {
  // FIXME do we need to adjust this to take in account query elements?
  // If the event target is not a Tracked Element it must be a queried Element. We let its events bubble up
  if (!isTrackedElement(eventTarget)) {
    return false;
  }

  const originElementId = originElement.getAttribute(TrackingAttribute.elementId);
  const targetElementId = eventTarget.getAttribute(TrackingAttribute.elementId);

  return originElementId !== targetElementId;
};

export default isBubbledEvent;

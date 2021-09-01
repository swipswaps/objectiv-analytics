import { ElementTrackingAttribute } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';

/**
 * Checks if the given origin Tracked Element and the Event Target are the same Tracked Element.
 */
const isBubbledEvent = (originElement: Element, eventTarget: EventTarget): boolean => {
  // Let Events originating from non Tracked Elements bubble up to, possibly, a parent Tracked Element
  if (!isTrackedElement(eventTarget)) {
    return false;
  }

  const originElementId = originElement.getAttribute(ElementTrackingAttribute.elementId);
  const targetElementId = eventTarget.getAttribute(ElementTrackingAttribute.elementId);

  return originElementId !== targetElementId;
};

export default isBubbledEvent;

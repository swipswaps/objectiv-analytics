import { ChildrenTrackingAttribute, ElementTrackingAttribute } from '../TrackingAttributes';
import { isChildrenTrackingElement, isTrackableElement, TrackedElement } from '../typeGuards';

/**
 * Check if Element is a Children Tracking Element. If so:
 * - Run its queries
 * - Decorate matching Elements intoTracked Elements
 * - Return a list of the decorated Elements
 */
const processChildrenTrackingElement = (element: Element): TrackedElement[] => {
  if (!isChildrenTrackingElement(element)) {
    return [];
  }

  // FIXME deserialize and process queries one by one
  const elementQuery = 'lol';
  const elementQueries = element.getAttribute(ChildrenTrackingAttribute.queries);
  if (!elementQueries) {
    return [];
  }

  // TODO make this in a querySelector, not querySelectorAll
  const queriedElements: TrackedElement[] = [];
  element.querySelectorAll(elementQueries).forEach((queriedElement, index) => {
    if (!isTrackableElement(queriedElement)) {
      return;
    }

    // Transfer TrackingAttributes from the original element to the new queriedElement
    const elementId = element.getAttribute(ElementTrackingAttribute.elementId);
    const context = element.getAttribute(ElementTrackingAttribute.context);
    const trackClicks = element.getAttribute(ElementTrackingAttribute.trackClicks);
    const trackBlurs = element.getAttribute(ElementTrackingAttribute.trackBlurs);
    const trackVisibility = element.getAttribute(ElementTrackingAttribute.trackVisibility);

    if (elementId) {
      // Copy tracking onto new Element
      queriedElement.setAttribute(ElementTrackingAttribute.elementId, elementId + '-' + elementQuery + '-' + index);
      if (context) {
        queriedElement.setAttribute(ElementTrackingAttribute.context, context);
      }
      if (trackClicks) {
        queriedElement.setAttribute(ElementTrackingAttribute.trackClicks, trackClicks);
      }
      if (trackBlurs) {
        queriedElement.setAttribute(ElementTrackingAttribute.trackBlurs, trackBlurs);
      }
      if (trackVisibility) {
        queriedElement.setAttribute(ElementTrackingAttribute.trackVisibility, trackVisibility);
      }
    }

    queriedElements.push(queriedElement as TrackedElement);
  });

  return queriedElements;
};

export default processChildrenTrackingElement;

import {
  makeClickEvent,
  makeInputChangeEvent,
  makeSectionHiddenEvent,
  makeSectionVisibleEvent,
  WebTracker,
} from '@objectiv/tracker-web';
import { isTrackedElement } from './isTrackedElement';
import { locateAndTrack } from './locateAndTrack';
import { TrackingAttribute } from './TrackingAttributes';

/**
 * Given a Mutation Observer node it will find all Tracked Elements:
 * - All Elements will be checked for visibility tracking and appropriate events will be triggered for them.
 * - Elements with the Objectiv Track Click attribute are bound to EventListener for Buttons, Links.
 * - Elements with the Objectiv Track Blur attribute are bound to EventListener for Inputs.
 * - When the listeners trigger, `locateAndTrack` will reconstruct a Location Stack and track the appropriate Events.
 */
function addEventListenersToTrackedElements(tracker: WebTracker, node: Element) {
  const elements = node.querySelectorAll(`[${TrackingAttribute.objectivElementId}]`);
  [node, ...Array.from(elements)].forEach((element) => {
    // Track visibility of newly mounted Elements
    trackIfVisible(tracker, element);

    // Attach Event listeners for clicks, blurs, etc
    if (isTrackedElement(element)) {
      if (element.dataset.objectivTrackClicks === 'true') {
        element.addEventListener('click', (event: Event) => {
          if (event.target && !isBubbledEvent(element, event.target)) {
            locateAndTrack(makeClickEvent, tracker, element);
          }
        });
      }
      if (element.dataset.objectivTrackBlurs === 'true') {
        element.addEventListener('blur', (event: Event) => {
          if (event.target && !isBubbledEvent(element, event.target)) {
            locateAndTrack(makeInputChangeEvent, tracker, element);
          }
        });
      }
    }
  });
}

/**
 * Checks if the given origin Tracked Element and the Event Target are the same Tracked Element.
 */
const isBubbledEvent = (originElement: Element, eventTarget: EventTarget) => {
  if (!isTrackedElement(eventTarget)) {
    return;
  }

  const originElementId = originElement.getAttribute(TrackingAttribute.objectivElementId);
  const targetElementId = eventTarget.getAttribute(TrackingAttribute.objectivElementId);

  return originElementId !== targetElementId;
};

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: true event for it.
 */
function trackIfVisible(tracker: WebTracker, element: Node) {
  if (isTrackedElement(element)) {
    if (element.dataset.objectivTrackVisibility === 'true' && element.dataset.objectivVisible === 'true') {
      locateAndTrack(makeSectionVisibleEvent, tracker, element);
    }
  }
}

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: false event for it.
 */
function trackIfHidden(tracker: WebTracker, element: Node) {
  if (isTrackedElement(element)) {
    if (element.dataset.objectivTrackVisibility === 'true' && element.dataset.objectivVisible === 'false') {
      locateAndTrack(makeSectionHiddenEvent, tracker, element);
    }
  }
}

/**
 * We use a Mutation Observer to monitor the DOM for subtrees being added.
 * When that happens we traverse the new Nodes and scout for Elements that have been enriched with our Tracking
 * Attributes. For those Elements we attach Event listeners which will automatically handle their tracking.
 *
 * The same Observer is also configured to monitor changes in our visibility attribute.
 * When we detect a change in the visibility of a tracked element we trigger the corresponding visibility events.
 */
export const startObservingDOM = (tracker: WebTracker) => {
  new MutationObserver((mutationsList) => {
    mutationsList.forEach(({ addedNodes, target, attributeName }) => {
      // New DOM nodes mutation: attach event listeners to all Tracked Elements
      addedNodes.forEach((addedNode) => {
        if (addedNode instanceof Element) {
          addEventListenersToTrackedElements(tracker, addedNode);
        }
      });

      // Visibility attribute mutation: determine visibility of Tracked Elements
      if (attributeName) {
        trackIfVisible(tracker, target);
        trackIfHidden(tracker, target);
      }
    });
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [TrackingAttribute.objectivVisible],
  });
};

import { makeClickEvent, makeInputChangeEvent, WebTracker } from '@objectiv/tracker-web';
import { isTrackedElement } from './isTrackedElement';
import { locateAndTrack } from "./locateAndTrack";
import { TrackingAttribute } from './TrackingAttributes';

/**
 * Given a Mutation Observer node it will find all Tracked Elements.
 * Elements with the Objectiv Track Click attribute are bound to EventListener for Buttons, Links.
 * Elements with the Objectiv Track Blur attribute are bound to EventListener for Inputs.
 * When the listeners trigger, `locateAndTrack` will reconstruct a Location Stack and track the appropriate Events.
 */
function addEventListenersToTrackedElements(tracker: WebTracker, node: Element) {
  const elements = node.querySelectorAll(`[${TrackingAttribute.objectivElementId}]`);
  elements.forEach((element) => {
    if (isTrackedElement(element)) {
      if (element.dataset.objectivTrackClicks === 'true') {
        element.addEventListener('click', (event: Event) => {
          locateAndTrack(makeClickEvent, tracker, event, element);
        })
      }
      if (element.dataset.objectivTrackBlurs === 'true') {
        element.addEventListener('blur', (event: Event) => {
          locateAndTrack(makeInputChangeEvent, tracker, event, element)
        });
      }
    }
  });
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
    mutationsList.forEach(({ addedNodes, target, attributeName, oldValue }) => {
      addedNodes.forEach((addedNode) => {
        if (addedNode instanceof Element) {
          addEventListenersToTrackedElements(tracker, addedNode);
        }
      });
      if(target instanceof HTMLElement && attributeName) {
        console.log('visibility change!', oldValue, ' > ', target.dataset.objectivVisible);
      }
    });
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,
    attributeFilter: [TrackingAttribute.objectivVisible]
  });
};

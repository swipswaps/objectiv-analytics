import { WebTracker } from '@objectiv/tracker-web';
import { blurEventListener } from './blurEventListener';
import { clickEventListener } from './clickEventListener';
import { isTrackedElement } from './isTrackedElement';
import { TrackingAttribute } from './TrackingAttributes';

/**
 * Given a Mutation Observer node it will find all Tracked Elements.
 * Elements with the Objectiv Track Click attribute are bound to a trackClickEventListener on 'click'.
 */
function addEventListenersToTrackedElements(tracker: WebTracker, node: HTMLElement) {
  const elements = node.querySelectorAll(`[${TrackingAttribute.objectivElementId}]`);
  elements.forEach((element) => {
    if (isTrackedElement(element)) {
      if (element.dataset.objectivTrackClicks === 'true') {
        element.addEventListener('click', (event: Event) => clickEventListener(tracker, event, element));
        console.log('Added event listener for Clicks on new Element: ', element.dataset.objectivContext);
      }
      if (element.dataset.objectivTrackBlurs === 'true') {
        element.addEventListener('blur', (event: Event) => blurEventListener(tracker, event, element));
        console.log('Added event listener for Blurs on new Element: ', element.dataset.objectivContext);
      }

      // TODO: visibility events
    }
  });
}

/**
 * We use a Mutation Observer to monitor the DOM for subtrees being added.
 * When that happens we traverse the new Nodes and scout for Elements that have been enriched with our Tracking
 * Attributes. For those Elements we attach Event listeners which will automatically handle their tracking.
 */
export const startObservingDOM = (tracker: WebTracker) => {
  new MutationObserver((mutationsList) => {
    mutationsList.forEach(({ addedNodes }) => {
      addedNodes.forEach((addedNode) => {
        if (isTrackedElement(addedNode)) {
          addEventListenersToTrackedElements(tracker, addedNode);
        }
      });
    });
  }).observe(document, {
    childList: true,
    subtree: true,
  });
};

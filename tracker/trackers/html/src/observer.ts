import { clickEventListener } from './clickEventListener';
import { isTrackedElement } from './isTrackedElement';
import { TrackingAttribute } from './TrackingAttributes';

/**
 * Given a Mutation Observer node it will find all Tracked Elements.
 * Elements with the Objectiv Track Click attribute are bound to a trackClickEventListener on 'click'.
 */
function addEventListenersToTrackedElements(node: HTMLElement) {
  const elements = node.querySelectorAll(`[${TrackingAttribute.objectivElementId}]`);
  elements.forEach((element) => {
    if (isTrackedElement(element)) {
      if (element.dataset.objectivTrackClick === 'true') {
        element.addEventListener('click', (event: Event) => clickEventListener(event, element));
      }
      // TODO: other events; such as hover, blur, etc
    }
  });
}

/**
 * We use a Mutation Observer to monitor the DOM for subtrees being added.
 * When that happens we traverse the new Nodes and scout for Elements that have been enriched with our Tracking
 * Attributes. For those Elements we attach Event listeners which will automatically handle their tracking.
 */
new MutationObserver((mutationsList) => {
  mutationsList.forEach(({ addedNodes }) => {
    addedNodes.forEach((addedNode) => {
      if (isTrackedElement(addedNode)) {
        addEventListenersToTrackedElements(addedNode);
      }
    });
  });
}).observe(document, {
  childList: true,
  subtree: true,
});

import { WebTracker } from '@objectiv/tracker-web';
import { ElementTrackingAttribute } from '../TrackingAttributes';
import { isTrackedElement } from '../typeGuards';
import processNewElements from './processNewElements';
import processRemovedElements from './processRemovedElements';
import trackIfHidden from './trackIfHidden';
import trackIfVisible from './trackIfVisible';

/**
 * We use a Mutation Observer to monitor the DOM for subtrees being added.
 * When that happens we traverse the new Nodes and scout for Elements that have been enriched with our Tracking
 * Attributes. For those Elements we attach Event listeners which will automatically handle their tracking.
 *
 * The same Observer is also configured to monitor changes in our visibility attribute.
 * When we detect a change in the visibility of a tracked element we trigger the corresponding visibility events.
 *
 * We also monitor nodes that are removed. If those nodes are Tracked Elements of which we were tracking visibility
 * we will trigger visibility: hidden events for them.
 */
export const startObservingDOM = (tracker: WebTracker = window.objectiv.tracker) => {
  new MutationObserver((mutationsList) => {
    mutationsList.forEach(({ addedNodes, removedNodes, target, attributeName }) => {
      // New DOM nodes mutation: attach event listeners to all Tracked Elements and track visibility:visible events
      addedNodes.forEach((addedNode) => {
        if (addedNode instanceof Element) {
          processNewElements(addedNode, tracker);
        }
      });

      // Removed DOM nodes mutation: track visibility:hidden events
      removedNodes.forEach((removedNode) => {
        if (removedNode instanceof Element) {
          processRemovedElements(removedNode, tracker);
        }
      });

      // Visibility attribute mutation (programmatic visibility change): determine and track visibility events
      if (attributeName && isTrackedElement(target)) {
        trackIfVisible(target, tracker);
        trackIfHidden(target, tracker);
      }
    });
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [ElementTrackingAttribute.trackVisibility],
  });
};

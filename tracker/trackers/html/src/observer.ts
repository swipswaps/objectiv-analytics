import { WebTracker } from '@objectiv/tracker-web';
import { isTrackedElement } from './isTrackedElement';
import { trackClick, trackInputChange, trackSectionHiddenEvent, trackSectionVisibleEvent } from './trackEvent';
import { TrackingAttribute, TrackingAttributeVisibility } from './TrackingAttributes';

/**
 * Given a Mutation Observer node containing newly added nodes it will find all Tracked Elements:
 * - All Elements will be checked for visibility tracking and appropriate events will be triggered for them.
 * - Elements with the Objectiv Track Click attribute are bound to EventListener for Buttons, Links.
 * - Elements with the Objectiv Track Blur attribute are bound to EventListener for Inputs.
 * - When the listeners trigger, `locateAndTrack` will reconstruct a Location Stack and track the appropriate Events.
 */
function trackNewElements(element: Element, tracker: WebTracker = window.objectiv.tracker) {
  const elements = element.querySelectorAll(`[${TrackingAttribute.elementId}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    // Visibility: visible tracking of newly mounted Elements
    trackIfVisible(element, tracker);

    // Attach Event listeners for clicks, blurs, etc
    if (isTrackedElement(element)) {
      // Click tracking (buttons, links)
      if (element.getAttribute(TrackingAttribute.trackClicks) === 'true') {
        element.addEventListener('click', (event: Event) => {
          if (event.target && !isBubbledEvent(element, event.target)) {
            trackClick({ element, tracker });
          }
        });
      }

      // Blur tracking (inputs)
      if (element.getAttribute(TrackingAttribute.trackBlurs) === 'true') {
        element.addEventListener('blur', (event: Event) => {
          if (event.target && !isBubbledEvent(element, event.target)) {
            trackInputChange({ element, tracker });
          }
        });
      }
    }
  });
}

/**
 * Given a Mutation Observer node containing removed nodes it will track whether to track visibility:hidden events
 * Hidden Events are triggered only for automatically tracked Elements.
 */
function untrackElements(element: Element, tracker: WebTracker = window.objectiv.tracker) {
  const elements = element.querySelectorAll(`[${TrackingAttribute.elementId}]`);
  [element, ...Array.from(elements)].forEach((element) => {
    // Track visibility:hidden of unmounted Elements
    if (isTrackedElement(element)) {
      const trackVisibilityAttribute = element.getAttribute(TrackingAttribute.trackVisibility);
      if (trackVisibilityAttribute !== null) {
        const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
        if (trackVisibilityConfig && trackVisibilityConfig.mode === 'auto') {
          trackSectionHiddenEvent({ element, tracker });
        }
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

  const originElementId = originElement.getAttribute(TrackingAttribute.elementId);
  const targetElementId = eventTarget.getAttribute(TrackingAttribute.elementId);

  return originElementId !== targetElementId;
};

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: visible event for it.
 */
function trackIfVisible(element: Node, tracker: WebTracker = window.objectiv.tracker) {
  if (isTrackedElement(element)) {
    const trackVisibilityAttribute = element.getAttribute(TrackingAttribute.trackVisibility);
    if (trackVisibilityAttribute !== null) {
      const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
      if (trackVisibilityConfig) {
        if (
          trackVisibilityConfig.mode === 'auto' ||
          (trackVisibilityConfig.mode === 'manual' && trackVisibilityConfig.isVisible)
        ) {
          trackSectionVisibleEvent({ element, tracker });
        }
      }
    }
  }
}

/**
 * Checks if the given Node is a tracked element and if we need to trigger a visibility: hidden event for it.
 */
function trackIfHidden(element: Node, tracker: WebTracker = window.objectiv.tracker) {
  if (isTrackedElement(element)) {
    const trackVisibilityAttribute = element.getAttribute(TrackingAttribute.trackVisibility);
    if (trackVisibilityAttribute !== null) {
      const trackVisibilityConfig: TrackingAttributeVisibility = JSON.parse(trackVisibilityAttribute);
      if (trackVisibilityConfig) {
        if (
          trackVisibilityConfig.mode === 'auto' ||
          (trackVisibilityConfig.mode === 'manual' && !trackVisibilityConfig.isVisible)
        ) {
          trackSectionHiddenEvent({ element, tracker });
        }
      }
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
          trackNewElements(addedNode, tracker);
        }
      });

      // Removed DOM nodes mutation: track visibility:hidden events
      removedNodes.forEach((removedNode) => {
        if (removedNode instanceof Element) {
          untrackElements(removedNode, tracker);
        }
      });

      // Visibility attribute mutation (programmatic visibility change): determine and track visibility events
      if (attributeName) {
        trackIfVisible(target, tracker);
        trackIfHidden(target, tracker);
      }
    });
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [TrackingAttribute.trackVisibility],
  });
};

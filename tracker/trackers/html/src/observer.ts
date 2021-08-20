import { WebTracker } from '@objectiv/tracker-web';
import { blurEventListener } from './blurEventListener';
import { clickEventListener } from './clickEventListener';
import { isTrackedElement } from './isTrackedElement';
import { TrackingAttribute } from './TrackingAttributes';

const intersectionObserver = new IntersectionObserver((what) => {
  console.log('visibility change for', what);
});

/**
 * Given a Mutation Observer node it will find all Tracked Elements.
 * Elements with the Objectiv Track Click attribute are bound to a trackClickEventListener on 'click'.
 */
function addEventListenersToTrackedElements(tracker: WebTracker, node: Element) {
  const elements = node.querySelectorAll(`[${TrackingAttribute.objectivElementId}]`);
  elements.forEach((element) => {
    if (isTrackedElement(element)) {
      if (element.dataset.objectivTrackClicks === 'true') {
        element.addEventListener('click', (event: Event) => clickEventListener(tracker, event, element));
        console.log('Added `click` event listener to Element:', element.dataset.objectivContext);
      }
      if (element.dataset.objectivTrackBlurs === 'true') {
        element.addEventListener('blur', (event: Event) => blurEventListener(tracker, event, element));
        console.log('Added `blur` event listener to Element:', element.dataset.objectivContext);
      }
      if (element.dataset.objectivTrackVisibility === 'true') {
        intersectionObserver.observe(element)
      }
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
    mutationsList.forEach(({ addedNodes, type, target }) => {
      addedNodes.forEach((addedNode) => {
        if(addedNode instanceof Element) {
          addEventListenersToTrackedElements(tracker, addedNode);
        }
      });
      if(type === 'attributes') {
        console.log(target, isVisible(target));
      }
    });
  }).observe(document, {
    childList: true,
    subtree: true,
    attributes: true
  });
};

function isVisible(elem: Node) {
  if (!(elem instanceof HTMLElement)) return false;
  const style = getComputedStyle(elem);
  if (style.display === 'none') return false;
  if (style.visibility !== 'visible') return false;
  if (style.opacity === '0') return false;
  if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
    elem.getBoundingClientRect().width === 0) {
    return false;
  }
  const elemCenter   = {
    x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
    y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
  };
  if (elemCenter.x < 0) return false;
  if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
  if (elemCenter.y < 0) return false;
  if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;

  return true

  // let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
  // do {
  //   if (pointContainer === elem) return true;
  // } while (pointContainer = pointContainer.parentNode);
  //return false;
}
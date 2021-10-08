import { TaggingAttribute } from '../TaggingAttribute';
import { BrowserTracker } from '../tracker/BrowserTracker';
import { trackClick } from '../tracker/trackEventHelpers';
import { isTaggedElement, TaggedElement } from '../typeGuards';

/**
 * A factory to make the event listener to attach to new TaggedElements with the `trackClicks` attributes set
 */
export const makeClickEventListener = (element: TaggedElement, tracker: BrowserTracker) => (event: Event) => {
  if (
    // Either the Event's target is the TaggedElement itself
    event.target === element ||
    // Or the Event's currentTarget is am Element tagged to track Clicks (eg: the Event bubbled up to from a child)
    (isTaggedElement(event.currentTarget) && event.currentTarget.hasAttribute(TaggingAttribute.trackClicks))
  ) {
    trackClick({ element, tracker });
  }
};

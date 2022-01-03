/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { BrowserTracker } from '../BrowserTracker';
import { isTaggedElement } from '../common/guards/isTaggedElement';
import { TaggedElement } from '../definitions/TaggedElement';
import { TaggingAttribute } from '../definitions/TaggingAttribute';
import { trackInputChangeEvent } from '../eventTrackers/trackInputChangeEvent';

/**
 * A factory to make the event handler to attach to new TaggedElements with the `trackBlurs` attributes set
 */
export const makeBlurEventHandler = (element: TaggedElement, tracker?: BrowserTracker) => (event: Event) => {
  if (
    // Either the Event's target is the TaggedElement itself
    event.target === element ||
    // Or the Event's currentTarget is am Element tagged to track Clicks (eg: the Event bubbled up to from a child)
    (isTaggedElement(event.currentTarget) && event.currentTarget.hasAttribute(TaggingAttribute.trackBlurs))
  ) {
    trackInputChangeEvent({ element, tracker });
  }
};

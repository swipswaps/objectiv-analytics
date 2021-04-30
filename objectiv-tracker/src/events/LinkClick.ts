import { Tracker } from '../Tracker';
import { LinkContext } from '../contexts';

export function trackLinkClick(tracker: Tracker, linkContext?: LinkContext) {
  tracker.trackEvent({
    event: 'ClickEvent',
    location_stack: [linkContext],
  });
}

export function onLinkClick(tracker: Tracker, buttonContext?: LinkContext) {
  return () => trackLinkClick(tracker, buttonContext);
}

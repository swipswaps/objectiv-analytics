import { Tracker } from '../Tracker';
import { ButtonContext } from '../contexts';

export function trackButtonClick(tracker: Tracker, buttonContext?: ButtonContext) {
  tracker.trackEvent({
    event: 'ClickEvent',
    location_stack: [buttonContext],
  });
}

export function onButtonClick(tracker: Tracker, buttonContext?: ButtonContext) {
  return () => trackButtonClick(tracker, buttonContext);
}

import {TrackerEvent} from '@objectiv/core';

/**
 * URLChangedEvent triggers on each URL change. The URL can be retrieved from the WebDocumentContext
 */
export class URLChangedEvent extends TrackerEvent {
  readonly eventName: string =  'URLChangeEvent';
}

/**
 * There's no observer for URL changes, thus we spy on the History API by patching `pushState` and `replaceState`
 */
const spyOnHistoryMethods = (methods: string[] = ['pushState', 'replaceState']) => methods.forEach(method => {
  // Get the History API instance
  const history: History = window.history;

  // Save the original History API method so we may still call it as-is
  const originalHistoryMethod = history[method];

    // We use a standard function so we can access the `arguments`
    window.history[method] = function (state) {
      // Run the original history methods
      const result = originalHistoryMethod.apply(this, arguments);
      const event = new Event(method.toLowerCase());

      (event as any).state = state;

      window.dispatchEvent(event);

      return result;
    };
  })

import { DocumentLoadedEvent, URLChangedEvent } from '@objectiv/schema';
import { ContextsConfig } from './Context';

/**
 * DocumentLoadedEvent factory
 */
export const makeDocumentLoadedEvent = (props?: ContextsConfig): DocumentLoadedEvent => ({
  _interactive_event: false,
  event: 'DocumentLoadedEvent',
  globalContexts: props?.globalContexts ?? [],
  locationStack: props?.locationStack ?? [],
});

/**
 * URLChangedEvent factory
 */
export const makeURLChangedEvent = (props?: ContextsConfig): URLChangedEvent => ({
  _interactive_event: false,
  event: 'URLChangedEvent',
  globalContexts: props?.globalContexts ?? [],
  locationStack: props?.locationStack ?? [],
});

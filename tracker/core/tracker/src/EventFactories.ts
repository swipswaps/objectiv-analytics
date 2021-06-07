import {
  AbstractGlobalContext,
  AbstractLocationContext,
  DocumentLoadedEvent,
  WebDocumentContext,
} from '@objectiv/schema';

/**
 * DocumentLoadedEvent. Configuration props and Factory. Location Stack must contain a WebDocumentContext.
 */
export type DocumentLoadedEventConfig = {
  globalContexts?: AbstractGlobalContext[];
  locationStack: [WebDocumentContext, ...AbstractLocationContext[]];
};
export const makeDocumentLoadedEvent = (props: DocumentLoadedEventConfig): DocumentLoadedEvent =>
  new (class implements DocumentLoadedEvent {
    readonly _interactive_event = false;
    readonly event = 'DocumentLoadedEvent';
    readonly globalContexts: AbstractGlobalContext[];
    readonly locationStack: [WebDocumentContext, ...AbstractLocationContext[]];

    constructor(props: DocumentLoadedEventConfig) {
      this.globalContexts = props.globalContexts ?? [];
      this.locationStack = props.locationStack;
    }
  })(props);

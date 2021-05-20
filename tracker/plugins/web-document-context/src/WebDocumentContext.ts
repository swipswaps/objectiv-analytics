import { GlobalContext, TrackerEvent, TrackerPlugin } from '@objectiv/core';

const WEB_DOCUMENT_CONTEXT_TYPE = 'WebDocumentContext';

/**
 * WebDocumentContext is a GlobalContext tracking the main `document` url automatically.
 */
export type WebDocumentContext = GlobalContext & {
  _context_type: typeof WEB_DOCUMENT_CONTEXT_TYPE;
  url: string;
};

/**
 * WebDocumentContext factory
 */
export function newWebDocumentContext({ documentContextId }: { documentContextId: string }): WebDocumentContext {
  return {
    _context_type: WEB_DOCUMENT_CONTEXT_TYPE,
    id: documentContextId,
    url: document.location.href,
  };
}

/**
 * WebDocumentContextConfig allows to optionally specify a custom ID for the WebDocumentContext
 */
export type WebDocumentContextConfig = {
  documentContextId?: string;
};

/**
 * The WebDocumentContext Plugin gathers the current URL from the main document using the Location API.
 * It implements the `run` method. This ensures the URL is retrieved before each Event is sent.
 */
export class WebDocumentContextPlugin implements TrackerPlugin {
  readonly pluginName = `${WEB_DOCUMENT_CONTEXT_TYPE}Plugin`;
  readonly documentContextId: string;

  /**
   * Specifying a custom ID may be useful when dealing with sub-Documents. Eg: to treat them as a single Document.
   * If no ID is specified the document's `nodeName` is used.
   */
  constructor(config?: WebDocumentContextConfig) {
    this.documentContextId = config?.documentContextId ?? document.nodeName;
  }

  /**
   * Generate a fresh WebDocumentContext before each TrackerEvent is handed over to the Transport.
   */
  beforeTransport(event: TrackerEvent): void {
    event.globalContexts.push(newWebDocumentContext({ documentContextId: this.documentContextId }));
  }
}

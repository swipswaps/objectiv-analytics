import { GlobalContext } from '@objectiv/core';

export const WEB_DOCUMENT_CONTEXT_TYPE = 'WebDocumentContext';

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

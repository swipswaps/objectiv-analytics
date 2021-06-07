import { WebDocumentContext } from '@objectiv/schema';

export const WEB_DOCUMENT_CONTEXT_TYPE = 'WebDocumentContext';

/**
 * WebDocumentContext factory
 */
export function newWebDocumentContext({ documentContextId }: { documentContextId: string }): WebDocumentContext {
  return {
    _location_context: true,
    _section_context: true,
    _context_type: WEB_DOCUMENT_CONTEXT_TYPE,
    id: documentContextId,
    url: document.location.href,
  };
}

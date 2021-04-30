export const WEB_DOCUMENT_CONTEXT_TYPE = 'WebDocumentContext';

export type WebDocumentContext = {
  _context_type: typeof WEB_DOCUMENT_CONTEXT_TYPE;
  id: string;
  url: string;
};

export function createWebDocumentContext({ id, href, ...rest }: { id: string; href: string }): WebDocumentContext {
  return {
    _context_type: WEB_DOCUMENT_CONTEXT_TYPE,
    id,
    url: href,
    ...rest,
  };
}

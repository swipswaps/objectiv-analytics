export const LINK_CONTEXT_TYPE = 'LinkContext';

export type LinkContext = {
  _context_type: typeof LINK_CONTEXT_TYPE;
  id: string;
  path: string;
  text: string;
};

export function createLinkContext({
  id,
  text,
  href,
  ...rest
}: { id: string; text?: string; href: string } | { id: string; text: string; href?: string }): LinkContext {
  return {
    _context_type: LINK_CONTEXT_TYPE,
    id,
    path: href ?? id,
    text: text ?? id,
    ...rest,
  };
}

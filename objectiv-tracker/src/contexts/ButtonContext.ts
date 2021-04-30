export const BUTTON_CONTEXT_TYPE = 'ButtonContext';

export type ButtonContext = {
  _context_type: typeof BUTTON_CONTEXT_TYPE;
  id: string;
  path: string;
  text: string;
};

export function createButtonContext({ id, text, ...rest }: { id: string; text: string }): ButtonContext {
  return {
    _context_type: BUTTON_CONTEXT_TYPE,
    id,
    path: id,
    text: text ?? id,
    ...rest,
  };
}

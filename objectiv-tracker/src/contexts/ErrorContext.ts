export const ERROR_CONTEXT_TYPE = 'ErrorContext';

export type ErrorContext = {
  _context_type: typeof ERROR_CONTEXT_TYPE;
  message: string;
};

export function createErrorContext({ message }: { message: string }): ErrorContext {
  return {
    _context_type: ERROR_CONTEXT_TYPE,
    message,
  };
}

export function createErrorContextFromError(error: Error) {
  return createErrorContext({ message: error.message });
}

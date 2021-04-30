export const TEST_CONTEXT_TYPE = 'TestContext';

export type TestContext = {
  _context_type: typeof TEST_CONTEXT_TYPE;
  foo: string;
};

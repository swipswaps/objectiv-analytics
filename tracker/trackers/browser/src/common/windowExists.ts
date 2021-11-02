/**
 * Helper function to check if window exists. Used to detect non-browser environments or SSR.
 */
export const windowExists = () => typeof window !== 'undefined';

/*
 * Copyright 2022 Objectiv B.V.
 */

import { developerTools, makeGlobalDeveloperTools } from '../src/makeGlobalDeveloperTools';

describe('index', () => {
  it('Should create the objectiv global', async () => {
    expect(globalThis.objectiv).toBeUndefined();
    import('../src');
    makeGlobalDeveloperTools();
    expect(globalThis.objectiv?.developerTools).toBe(developerTools);
  });
});

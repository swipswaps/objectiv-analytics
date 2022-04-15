/*
 * Copyright 2022 Objectiv B.V.
 */

import { developerTools, makeGlobalDeveloperTools } from '../src/makeGlobalDeveloperTools';

describe('makeGlobalDeveloperTools', () => {
  it('Should create the objectiv global if not present', async () => {
    expect(globalThis.objectiv).toBeUndefined();
    makeGlobalDeveloperTools();
    expect(globalThis.objectiv).toStrictEqual(developerTools);
  });

  it('Should extend the objectiv global if present', async () => {
    globalThis.objectiv = {
      // @ts-ignore
      someOtherGlobal: 'test',
    };
    expect(globalThis.objectiv).toStrictEqual({
      someOtherGlobal: 'test',
    });
    makeGlobalDeveloperTools();
    expect(globalThis.objectiv).toStrictEqual({
      someOtherGlobal: 'test',
      ...developerTools,
    });
  });
});

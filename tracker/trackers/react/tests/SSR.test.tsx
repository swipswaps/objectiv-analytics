/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { MockConsoleImplementation, SpyTransport } from '@objectiv/testing-tools';
import { isDevMode, TrackerConsole } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import React from 'react';
import { LocationTree, ObjectivProvider, ReactTracker, TrackedMain } from '../src';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('Browser / SSR', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.spyOn(LocationTree, 'initialize');
    jest.spyOn(LocationTree, 'add');
    jest.spyOn(LocationTree, 'remove');
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    jest.resetAllMocks();
    process.env = OLD_ENV;
  });

  it('LocationTree: should not be invoked', () => {
    process.env.NODE_ENV = 'production';

    expect(isDevMode()).toBe(false);

    const tracker = new ReactTracker({ applicationId: 'app-id', transport: new SpyTransport() });

    const { rerender, unmount } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedMain>test</TrackedMain>
      </ObjectivProvider>
    );

    rerender(
      <ObjectivProvider tracker={tracker}>
        <TrackedMain>children change!</TrackedMain>
      </ObjectivProvider>
    );

    unmount();

    expect(LocationTree.initialize).not.toHaveBeenCalled();
    expect(LocationTree.add).not.toHaveBeenCalled();
    expect(LocationTree.remove).not.toHaveBeenCalled();
  });

  it('LocationTree: should not be invoked', () => {
    process.env.NODE_ENV = 'development';

    expect(isDevMode()).toBe(true);

    const tracker = new ReactTracker({ applicationId: 'app-id', transport: new SpyTransport() });

    const { rerender, unmount } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedMain>test</TrackedMain>
      </ObjectivProvider>
    );

    rerender(
      <ObjectivProvider tracker={tracker}>
        <TrackedMain>children change!</TrackedMain>
      </ObjectivProvider>
    );

    unmount();

    expect(LocationTree.initialize).toHaveBeenCalled();
    expect(LocationTree.add).toHaveBeenCalled();
    expect(LocationTree.remove).toHaveBeenCalled();
  });
});

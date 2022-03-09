/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { GlobalContextValidationRule, Tracker } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import React from 'react';
import { TrackerProvider, useTracker } from '../src';

describe('TrackerProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const tracker = new Tracker({ applicationId: 'app-id' });

  const expectedState = {
    tracker: {
      active: true,
      applicationId: 'app-id',
      console: undefined,
      global_contexts: [],
      location_stack: [],
      plugins: {
        tracker,
        console: undefined,
        plugins: [
          {
            applicationContext: { __global_context: true, _type: 'ApplicationContext', id: 'app-id' },
            console: undefined,
            pluginName: 'ApplicationContextPlugin',
            validationRules: [
              new GlobalContextValidationRule({
                contextName: 'ApplicationContext',
                once: true,
                logPrefix: 'ApplicationContextPlugin',
              }),
            ],
          },
          {
            console: undefined,
            pluginName: 'OpenTaxonomyValidationPlugin',
          },
        ],
      },
      queue: undefined,
      trackerId: 'app-id',
      transport: undefined,
    },
  };

  it('should support children components', () => {
    const Component = () => {
      const trackerContext = useTracker();

      console.log({ tracker: trackerContext });

      return null;
    };

    render(
      <TrackerProvider tracker={tracker}>
        <Component />
      </TrackerProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expectedState);
  });

  it('should support render-props', () => {
    render(<TrackerProvider tracker={tracker}>{(trackerContext) => console.log(trackerContext)}</TrackerProvider>);

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expectedState);
  });
});

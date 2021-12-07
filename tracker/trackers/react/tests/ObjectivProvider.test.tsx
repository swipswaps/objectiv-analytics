/*
 * Copyright 2021 Objectiv B.V.
 */

import { render } from '@testing-library/react';
import { ObjectivProvider, ReactTracker } from '../src';
import { useTrackingContext } from '../src/hooks/useTrackingContext';

describe('ObjectivProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  const tracker = new ReactTracker({ applicationId: 'app-id' });

  const expectedState = {
    locationEntries: [],
    locationStack: [],
    tracker: {
      active: true,
      applicationId: 'app-id',
      console: undefined,
      global_contexts: [],
      location_stack: [],
      plugins: {
        console: undefined,
        plugins: [
          {
            applicationContext: { __global_context: true, _type: 'ApplicationContext', id: 'app-id' },
            console: undefined,
            pluginName: 'ApplicationContextPlugin',
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
      const trackingContext = useTrackingContext();

      console.log(trackingContext);

      return null;
    };

    render(
      <ObjectivProvider tracker={tracker}>
        <Component />
      </ObjectivProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expectedState);
  });

  it('should support render-props', () => {
    render(<ObjectivProvider tracker={tracker}>{(trackingContext) => console.log(trackingContext)}</ObjectivProvider>);

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expectedState);
  });
});

/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { Tracker } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import React from 'react';
import { ContentContextWrapper, ObjectivProvider, useParentLocationContext } from '../src/';

describe('useParentLocationContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the parent location context', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    const TestChild = () => {
      const parentLocationContext = useParentLocationContext();

      console.debug(parentLocationContext);

      return <div>test child</div>;
    };

    render(
      <ObjectivProvider tracker={tracker}>
        <ContentContextWrapper id={'parent-1'}>
          <ContentContextWrapper id={'parent-2'}>
            <TestChild />
          </ContentContextWrapper>
        </ContentContextWrapper>
      </ObjectivProvider>
    );

    expect(console.debug).toHaveBeenCalledTimes(1);
    expect(console.debug).toHaveBeenNthCalledWith(1, expect.objectContaining({ id: 'parent-2' }));
  });
});

/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { Tracker } from "@objectiv/tracker-core";
import { render } from "@testing-library/react";
import React from "react";
import { LocationContextWrapper, makeContentContext, ObjectivProvider, useParentLocationContext } from '../src/';

describe('useParentLocationContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'log');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return the parent location context', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    const parentContext1 = makeContentContext({ id: 'parent-1' });
    const parentContext2 = makeContentContext({ id: 'parent-2' });

    const TestChild = () => {
      const parentLocationContext = useParentLocationContext();

      console.log(parentLocationContext);

      return <div>test child</div>;
    };

    render(
      <ObjectivProvider tracker={tracker}>
        <LocationContextWrapper locationContext={parentContext1}>
          <LocationContextWrapper locationContext={parentContext2}>
            <TestChild />
          </LocationContextWrapper>
        </LocationContextWrapper>
      </ObjectivProvider>
    );

    expect(console.log).toHaveBeenCalledTimes(1);
    expect(console.log).toHaveBeenNthCalledWith(1, expect.objectContaining(parentContext2));

  })
});

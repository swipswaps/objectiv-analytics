/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from '@objectiv/testing-tools';
import { Tracker } from '@objectiv/tracker-core';
import { fireEvent, getByText, render, screen, waitFor } from '@testing-library/react';
import React, { createRef } from 'react';
import { LocationTree, ObjectivProvider, TrackedPressableContext } from '../src';

describe('TrackedPressableContext', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    LocationTree.clear();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.useRealTimers();
  });

  it('should wrap the given Component in a PressableContext', () => {
    const spyTransport = new SpyTransport();
    jest.spyOn(spyTransport, 'handle');
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext Component={'button'} id={'pressable-id'}>
          Trigger Event
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    fireEvent.click(getByText(container, /trigger event/i));

    expect(spyTransport.handle).toHaveBeenCalledTimes(2);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'ApplicationLoadedEvent',
      })
    );
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'PressableContext',
            id: 'pressable-id',
          }),
        ],
      })
    );
  });

  it('should allow forwarding the id property', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext Component={'button'} id={'pressable-id-1'} data-testid={'test-pressable-1'}>
          test
        </TrackedPressableContext>
        <TrackedPressableContext
          Component={'button'}
          id={'pressable-id-2'}
          forwardId={true}
          data-testid={'test-pressable-2'}
        >
          test
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    expect(screen.getByTestId('test-pressable-1').getAttribute('id')).toBe(null);
    expect(screen.getByTestId('test-pressable-2').getAttribute('id')).toBe('pressable-id-2');
  });

  it('should allow forwarding the title property', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext
          Component={'a'}
          id={'pressable-id-1'}
          title={'Press me'}
          data-testid={'test-pressable-1'}
        >
          test
        </TrackedPressableContext>
        <TrackedPressableContext
          Component={'a'}
          id={'pressable-id-2'}
          title={'Press me'}
          forwardTitle={true}
          data-testid={'test-pressable-2'}
        >
          test
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    expect(screen.getByTestId('test-pressable-1').getAttribute('title')).toBe(null);
    expect(screen.getByTestId('test-pressable-2').getAttribute('title')).toBe('Press me');
  });

  it('should allow forwarding refs', () => {
    const tracker = new Tracker({ applicationId: 'app-id' });
    const ref = createRef<HTMLDivElement>();

    render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext Component={'a'} data-testid={'test-pressable'} ref={ref}>
          Press me!
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    expect(ref.current).toMatchInlineSnapshot(`
      <a
        data-testid="test-pressable"
      >
        Press me!
      </a>
    `);
  });

  it('should execute the given onClick as well', async () => {
    const clickSpy = jest.fn();
    const tracker = new Tracker({ applicationId: 'app-id' });

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext
          Component={'button'}
          id={'pressable-id'}
          onClick={clickSpy}
          data-testid={'test-pressable'}
        >
          Press me
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    fireEvent.click(getByText(container, /press me/i));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
  });

  it('should not wait until tracked', async () => {
    jest.useFakeTimers();
    const clickSpy = jest.fn();
    const spyTransport = new SpyTransport();
    const handleMock = jest.fn(async () => new Promise((resolve) => setTimeout(resolve, 10000)));
    jest.spyOn(spyTransport, 'handle').mockImplementation(handleMock);
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext
          Component={'button'}
          waitUntilTracked={false}
          data-testid={'test-pressable'}
          onClick={clickSpy}
        >
          Press me
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.click(getByText(container, /press me/i));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    expect(handleMock).not.toHaveBeenCalled();
  });

  it('should wait until tracked', async () => {
    jest.useFakeTimers();
    const clickSpy = jest.fn();
    const spyTransport = new SpyTransport();
    jest
      .spyOn(spyTransport, 'handle')
      .mockImplementation(async () => new Promise((resolve) => setTimeout(resolve, 100)));
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

    const { container } = render(
      <ObjectivProvider tracker={tracker}>
        <TrackedPressableContext
          Component={'button'}
          waitUntilTracked={true}
          data-testid={'test-pressable'}
          onClick={clickSpy}
        >
          Press me
        </TrackedPressableContext>
      </ObjectivProvider>
    );

    jest.resetAllMocks();

    fireEvent.click(getByText(container, /press me/i));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: [
          expect.objectContaining({
            _type: 'PressableContext',
            id: 'press-me',
          }),
        ],
      })
    );
  });
});

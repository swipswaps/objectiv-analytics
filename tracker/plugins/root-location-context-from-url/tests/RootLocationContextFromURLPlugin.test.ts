/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsoleImplementation } from '@objectiv/testing-tools';
import { ContextsConfig, Tracker, TrackerConsole, TrackerEvent } from '@objectiv/tracker-core';
import { RootLocationContextFromURLPlugin } from '../src';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('RootLocationContextFromURLPlugin', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('should add the RootLocationContext to the Event when `enrich` is executed by the Tracker', async () => {
    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new RootLocationContextFromURLPlugin()],
    });
    const eventContexts: ContextsConfig = {
      location_stack: [
        { __location_context: true, _type: 'section', id: 'A' },
        { __location_context: true, _type: 'section', id: 'B' },
      ],
      global_contexts: [
        { __global_context: true, _type: 'GlobalA', id: 'abc' },
        { __global_context: true, _type: 'GlobalB', id: 'def' },
      ],
    };
    const testEvent = new TrackerEvent({ _type: 'test-event', ...eventContexts });
    expect(testEvent.location_stack).toHaveLength(2);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(3);
    expect(trackedEvent.location_stack[0]).toEqual({
      __location_context: true,
      _type: 'RootLocationContext',
      id: 'home',
    });
    expect(trackedEvent.global_contexts).toHaveLength(2);
  });

  it('should add the RootLocationContext with id: home', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '',
      },
      writable: true,
    });

    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new RootLocationContextFromURLPlugin()],
    });
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    expect(testEvent.location_stack).toHaveLength(0);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(1);
    expect(trackedEvent.location_stack[0]).toEqual({
      __location_context: true,
      _type: 'RootLocationContext',
      id: 'home',
    });
  });

  it('should add the RootLocationContext with id: home', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/',
      },
      writable: true,
    });

    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new RootLocationContextFromURLPlugin()],
    });
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    expect(testEvent.location_stack).toHaveLength(0);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(1);
    expect(trackedEvent.location_stack[0]).toEqual({
      __location_context: true,
      _type: 'RootLocationContext',
      id: 'home',
    });
  });

  it('should add the RootLocationContext with id: dashboard', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        pathname: '/dashboard/some/more/slugs',
      },
      writable: true,
    });

    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new RootLocationContextFromURLPlugin()],
    });
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    expect(testEvent.location_stack).toHaveLength(0);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(1);
    expect(trackedEvent.location_stack[0]).toEqual({
      __location_context: true,
      _type: 'RootLocationContext',
      id: 'dashboard',
    });
  });

  it('should console.error', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        // Can't really happen, but just to test this case
        pathname: null,
      },
      writable: true,
    });

    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new RootLocationContextFromURLPlugin()],
    });
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    expect(testEvent.location_stack).toHaveLength(0);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(0);
    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(
      1,
      `%c｢objectiv:RootLocationContextFromURLPlugin｣ Could not generate a RootLocationContext from "null"`,
      `font-weight: bold`
    );
  });

  it('should allow overriding the id factory function', async () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'https://spa.app#welcome',
      },
      writable: true,
    });

    const makeRootLocationIdFromHash = () => location.href?.split('#')[1].trim().toLowerCase();

    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new RootLocationContextFromURLPlugin({ idFactoryFunction: makeRootLocationIdFromHash })],
    });
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    expect(testEvent.location_stack).toHaveLength(0);
    const trackedEvent = await testTracker.trackEvent(testEvent);
    expect(trackedEvent.location_stack).toHaveLength(1);
    expect(trackedEvent.location_stack[0]).toEqual({
      __location_context: true,
      _type: 'RootLocationContext',
      id: 'welcome',
    });
  });
});

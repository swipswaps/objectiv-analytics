/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */

import { mockConsoleImplementation } from '@objectiv/testing-tools';
import { generateUUID, makePressEvent, TrackerConsole } from '@objectiv/tracker-core';
import { DebugTransport } from '@objectiv/transport-debug';
import {
  BrowserTracker,
  getLocationHref,
  getTracker,
  makeMutationCallback,
  makeTracker,
  startAutoTracking,
  trackFailureEvent,
  trackApplicationLoadedEvent,
  trackSuccessEvent,
  trackEvent,
} from '../src';

TrackerConsole.setImplementation(mockConsoleImplementation);

describe('Without DOM', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should throw if Window does not exists', async () => {
    expect(() => makeTracker({ applicationId: generateUUID(), transport: new DebugTransport() })).toThrow(
      'Cannot access the Window interface.'
    );

    expect(() => getTracker()).toThrow('Cannot access the Window interface.');
  });

  it('should TrackerConsole.error if a Tracker instance cannot be retrieved because DOM is not available', async () => {
    const parameters = { eventFactory: makePressEvent, element: null };
    // @ts-ignore
    trackEvent(parameters);

    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(
      1,
      Error('Cannot access the Window interface.'),
      parameters
    );
  });

  it('should TrackerConsole.error id Application Loaded Event fails at retrieving the document element', () => {
    trackApplicationLoadedEvent();

    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(
      1,
      new ReferenceError('document is not defined'),
      {}
    );

    trackApplicationLoadedEvent({ onError: TrackerConsole.error });
    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(2);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(2, new ReferenceError('document is not defined'));
  });

  it('should TrackerConsole.error id Completed Event fails at retrieving the document element', () => {
    trackSuccessEvent({ message: 'ok' });

    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(1, new ReferenceError('document is not defined'), {
      message: 'ok',
    });

    trackSuccessEvent({ message: 'ok', onError: TrackerConsole.error });
    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(2);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(2, new ReferenceError('document is not defined'));
  });

  it('should TrackerConsole.error id Aborted Event fails at retrieving the document element', () => {
    trackFailureEvent({ message: 'ko' });

    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(1, new ReferenceError('document is not defined'), {
      message: 'ko',
    });

    trackFailureEvent({ message: 'ko', onError: TrackerConsole.error });
    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(2);
    expect(mockConsoleImplementation.error).toHaveBeenNthCalledWith(2, new ReferenceError('document is not defined'));
  });

  it('should return undefined', () => {
    expect(getLocationHref()).toBeUndefined();
  });

  it('should TrackerConsole.error when MutationObserver is not available', async () => {
    const tracker = new BrowserTracker({ applicationId: 'app', transport: new DebugTransport() });
    jest.spyOn(tracker, 'trackEvent');

    startAutoTracking();

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
  });

  it('should TrackerConsole.error when mutationCallback receives garbled data', async () => {
    const tracker = new BrowserTracker({ applicationId: 'app', transport: new DebugTransport() });
    jest.spyOn(tracker, 'trackEvent');
    const mutationCallback = makeMutationCallback();

    // @ts-ignore
    mutationCallback('not a list');

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(mockConsoleImplementation.error).toHaveBeenCalledTimes(1);
  });
});

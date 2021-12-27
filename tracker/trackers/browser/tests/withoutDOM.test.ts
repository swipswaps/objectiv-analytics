/*
 * Copyright 2021 Objectiv B.V.
 * @jest-environment node
 */

import { generateUUID, makePressEvent } from '@objectiv/tracker-core';
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

describe('Without DOM', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should throw if Window does not exists', async () => {
    expect(() => makeTracker({ applicationId: generateUUID(), transport: new DebugTransport() })).toThrow(
      'Cannot access the Window interface.'
    );

    expect(() => getTracker()).toThrow('Cannot access the Window interface.');
  });

  it('should console.error if a Tracker instance cannot be retrieved because DOM is not available', async () => {
    const parameters = { eventFactory: makePressEvent, element: null };
    // @ts-ignore
    trackEvent(parameters);

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, Error('Cannot access the Window interface.'), parameters);
  });

  it('should console.error id Application Loaded Event fails at retrieving the document element', () => {
    trackApplicationLoadedEvent();

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, new ReferenceError('document is not defined'), {});

    trackApplicationLoadedEvent({ onError: console.error });
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenNthCalledWith(2, new ReferenceError('document is not defined'));
  });

  it('should console.error id Completed Event fails at retrieving the document element', () => {
    trackSuccessEvent({ message: 'ok' });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, new ReferenceError('document is not defined'), { message: 'ok' });

    trackSuccessEvent({ message: 'ok', onError: console.error });
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenNthCalledWith(2, new ReferenceError('document is not defined'));
  });

  it('should console.error id Aborted Event fails at retrieving the document element', () => {
    trackFailureEvent({ message: 'ko' });

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenNthCalledWith(1, new ReferenceError('document is not defined'), { message: 'ko' });

    trackFailureEvent({ message: 'ko', onError: console.error });
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenNthCalledWith(2, new ReferenceError('document is not defined'));
  });

  it('should return undefined', () => {
    expect(getLocationHref()).toBeUndefined();
  });

  it('should console error when MutationObserver is not available', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const tracker = new BrowserTracker({ applicationId: 'app', transport: new DebugTransport() });
    jest.spyOn(tracker, 'trackEvent');

    startAutoTracking();

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('should console error when mutationCallback receives garbled data', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const tracker = new BrowserTracker({ applicationId: 'app', transport: new DebugTransport() });
    jest.spyOn(tracker, 'trackEvent');
    const mutationCallback = makeMutationCallback();

    // @ts-ignore
    mutationCallback('not a list');

    expect(tracker.trackEvent).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(1);
  });
});

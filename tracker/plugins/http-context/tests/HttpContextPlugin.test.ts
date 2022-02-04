/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import { ContextsConfig, Tracker, TrackerEvent, TrackerPlugins } from '@objectiv/tracker-core';
import { HttpContextPlugin } from '../src';

describe('HttpContextPlugin', () => {
  it('should instantiate without a console', () => {
    const testHttpContextPlugin = new HttpContextPlugin();
    expect(testHttpContextPlugin).toBeInstanceOf(HttpContextPlugin);
    expect(testHttpContextPlugin.console).toBeUndefined();
  });

  it('should instantiate with the given console', () => {
    const testHttpContextPlugin = new HttpContextPlugin({ console: mockConsole });
    expect(testHttpContextPlugin).toBeInstanceOf(HttpContextPlugin);
    expect(testHttpContextPlugin.console).toBe(mockConsole);
  });

  it('should add the HttpContext to the Event when `initialize` is executed by the Tracker', async () => {
    const originalReferrer = document.referrer;
    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(document, 'referrer', { value: 'MOCK_REFERRER', configurable: true });
    Object.defineProperty(navigator, 'userAgent', { value: 'MOCK_USER_AGENT', configurable: true });

    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: new TrackerPlugins({ plugins: [new HttpContextPlugin()] }),
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
    expect(trackedEvent.location_stack).toHaveLength(2);
    expect(trackedEvent.global_contexts).toHaveLength(3);
    expect(trackedEvent.global_contexts).toEqual(
      expect.arrayContaining([
        {
          __global_context: true,
          _type: 'HttpContext',
          id: 'http_context',
          referer: 'MOCK_REFERRER',
          remote_address: '127.0.0.1',
          user_agent: 'MOCK_USER_AGENT',
        },
      ])
    );

    Object.defineProperty(document, 'referrer', { value: originalReferrer });
    Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent });
  });
});

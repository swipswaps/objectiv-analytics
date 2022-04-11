/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import '@objectiv/developer-tools';
import { MockConsoleImplementation } from '@objectiv/testing-tools';
import { makeHttpContext, Tracker, TrackerConsole, TrackerEvent } from '@objectiv/tracker-core';
import { HttpContextPlugin } from '../src';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('HttpContextPlugin', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('Validation', () => {
    const testTracker = new Tracker({
      applicationId: 'app-id',
      plugins: [new HttpContextPlugin()],
      trackApplicationContext: false,
    });

    it('should TrackerConsole.error when calling `validate` before `initialize`', () => {
      const testHttpContextPlugin = new HttpContextPlugin();
      const validEvent = new TrackerEvent({
        _type: 'test',
        global_contexts: [
          makeHttpContext({
            id: '/test',
            user_agent: 'test',
            referrer: 'test',
            remote_address: 'test',
          }),
        ],
      });
      testHttpContextPlugin.validate(validEvent);
      expect(MockConsoleImplementation.error).toHaveBeenCalledWith(
        '｢objectiv:HttpContextPlugin｣ Cannot validate. Make sure to initialize the plugin first.'
      );
    });

    it('should succeed', () => {
      const testHttpContextPlugin = new HttpContextPlugin();
      testHttpContextPlugin.initialize(testTracker);
      const validEvent = new TrackerEvent({
        _type: 'test',
        global_contexts: [
          makeHttpContext({
            id: '/test',
            user_agent: 'test',
            referrer: 'test',
            remote_address: 'test',
          }),
        ],
      });

      jest.resetAllMocks();

      testHttpContextPlugin.validate(validEvent);

      expect(MockConsoleImplementation.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should fail when given TrackerEvent does not have HttpContext', () => {
      const testHttpContextPlugin = new HttpContextPlugin();
      testHttpContextPlugin.initialize(testTracker);
      const eventWithoutHttpContext = new TrackerEvent({ _type: 'TestEvent' });

      jest.resetAllMocks();

      testHttpContextPlugin.validate(eventWithoutHttpContext);

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        '%c｢objectiv:HttpContextPlugin｣ Error: HttpContext is missing from Global Contexts of TestEvent.\n' +
          'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/global-contexts/HttpContext.',
        'color:red'
      );
    });

    it('should fail when given TrackerEvent has multiple HttpContexts', () => {
      const testHttpContextPlugin = new HttpContextPlugin();
      testHttpContextPlugin.initialize(testTracker);
      const eventWithDuplicatedHttpContext = new TrackerEvent({
        _type: 'TestEvent',
        global_contexts: [
          makeHttpContext({
            id: '/test',
            user_agent: 'test',
            referrer: 'test',
            remote_address: 'test',
          }),
          makeHttpContext({
            id: '/test',
            user_agent: 'test',
            referrer: 'test',
            remote_address: 'test',
          }),
        ],
      });

      jest.resetAllMocks();

      testHttpContextPlugin.validate(eventWithDuplicatedHttpContext);

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
        1,
        '%c｢objectiv:HttpContextPlugin｣ Error: Only one HttpContext should be present in Global Contexts of TestEvent.\n' +
          'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/global-contexts/HttpContext.',
        'color:red'
      );
    });
  });
});

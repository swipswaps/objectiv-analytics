/*
 * Copyright 2021-2022 Objectiv B.V.
 * @jest-environment node
 */
import { mockConsole } from '@objectiv/testing-tools';
import { makePathContext, TrackerEvent } from '@objectiv/tracker-core';
import { PathContextFromURLPlugin } from '../src';

describe('PathContextFromURLPlugin - node', () => {
  it('should instantiate as unusable', () => {
    const testPathContextFromURLPlugin = new PathContextFromURLPlugin();
    expect(testPathContextFromURLPlugin.isUsable()).toBe(false);
  });

  describe('Validation', () => {
    it('should not fail when given TrackerEvent does not have PathContext but plugin is not usable', () => {
      const testPathContextPlugin = new PathContextFromURLPlugin({ console: mockConsole });
      const eventWithoutPathContext = new TrackerEvent({ _type: 'test' });

      jest.resetAllMocks();

      testPathContextPlugin.validate(eventWithoutPathContext);

      expect(mockConsole.groupCollapsed).not.toHaveBeenCalled();
    });

    it('should not fail when given TrackerEvent has multiple PathContexts', () => {
      const testPathContextPlugin = new PathContextFromURLPlugin({ console: mockConsole });
      const eventWithDuplicatedPathContext = new TrackerEvent({
        _type: 'test',
        global_contexts: [makePathContext({ id: '/test' }), makePathContext({ id: '/test' })],
      });

      jest.resetAllMocks();

      testPathContextPlugin.validate(eventWithDuplicatedPathContext);

      expect(mockConsole.groupCollapsed).not.toHaveBeenCalled();
    });
  });
});

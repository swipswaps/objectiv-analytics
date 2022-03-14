/*
 * Copyright 2022 Objectiv B.V.
 */

import { MockConsoleImplementation } from '@objectiv/testing-tools';
import { GlobalContextValidationRule, LocationContextValidationRule, TrackerConsole, TrackerEvent } from '../src';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('Validation Rules', () => {
  describe('GlobalContextValidationRules', () => {
    it('Should TrackerConsole.error if given contextName is missing', () => {
      const testGlobalContextValidationRule = new GlobalContextValidationRule({
        contextName: 'Context',
      });

      jest.resetAllMocks();

      testGlobalContextValidationRule.validate(new TrackerEvent({ _type: 'PressEvent' }));

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:GlobalContextValidationRule｣ Error: Context is missing from Global Contexts.',
        'color:red'
      );
    });

    it('Should prefix TrackerConsole.error messages with logPrefix', () => {
      const testGlobalContextValidationRule = new GlobalContextValidationRule({
        contextName: 'Context',
        logPrefix: 'TestPrefix',
      });

      jest.resetAllMocks();

      testGlobalContextValidationRule.validate(new TrackerEvent({ _type: 'PressEvent' }));

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:TestPrefix:GlobalContextValidationRule｣ Error: Context is missing from Global Contexts.',
        'color:red'
      );
    });

    it('Should TrackerConsole.error if given contextName is present more than once', () => {
      const testGlobalContextValidationRule = new GlobalContextValidationRule({
        contextName: 'Context',
        once: true,
      });

      jest.resetAllMocks();

      testGlobalContextValidationRule.validate(
        new TrackerEvent({
          _type: 'PressEvent',
          global_contexts: [
            { __global_context: true, _type: 'Context', id: 'test' },
            { __global_context: true, _type: 'Context', id: 'test' },
          ],
        })
      );

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:GlobalContextValidationRule｣ Error: Only one Context should be present in Global Contexts.',
        'color:red'
      );
    });
  });

  describe('LocationContextValidationRules', () => {
    it('Should TrackerConsole.error if given contextName is missing', () => {
      const testLocationContextValidationRule = new LocationContextValidationRule({
        contextName: 'Context',
      });

      jest.resetAllMocks();

      testLocationContextValidationRule.validate(new TrackerEvent({ _type: 'PressEvent' }));

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:LocationContextValidationRule｣ Error: Context is missing from Location Stack.',
        'color:red'
      );
    });

    it('Should prefix TrackerConsole.error messages with logPrefix', () => {
      const testLocationContextValidationRule = new LocationContextValidationRule({
        contextName: 'Context',
        logPrefix: 'TestPrefix',
      });

      jest.resetAllMocks();

      testLocationContextValidationRule.validate(new TrackerEvent({ _type: 'PressEvent' }));

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:TestPrefix:LocationContextValidationRule｣ Error: Context is missing from Location Stack.',
        'color:red'
      );
    });

    it('Should TrackerConsole.error if given contextName is present more than once', () => {
      const testLocationContextValidationRule = new LocationContextValidationRule({
        contextName: 'Context',
        once: true,
      });

      jest.resetAllMocks();

      testLocationContextValidationRule.validate(
        new TrackerEvent({
          _type: 'PressEvent',
          location_stack: [
            { __location_context: true, _type: 'Context', id: 'test' },
            { __location_context: true, _type: 'Context', id: 'test' },
          ],
        })
      );

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:LocationContextValidationRule｣ Error: Only one Context should be present in Location Stack.',
        'color:red'
      );
    });

    it('Should TrackerConsole.error if given contextName is present in the wrong position', () => {
      const testLocationContextValidationRule = new LocationContextValidationRule({
        contextName: 'Context',
        once: true,
        position: 0,
      });

      jest.resetAllMocks();

      testLocationContextValidationRule.validate(
        new TrackerEvent({
          _type: 'PressEvent',
          location_stack: [
            { __location_context: true, _type: 'OtherContext', id: 'test' },
            { __location_context: true, _type: 'Context', id: 'test' },
          ],
        })
      );

      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(1);
      expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledWith(
        '%c｢objectiv:LocationContextValidationRule｣ Error: Context is in the wrong position of the Location Stack.',
        'color:red'
      );
    });
  });
});

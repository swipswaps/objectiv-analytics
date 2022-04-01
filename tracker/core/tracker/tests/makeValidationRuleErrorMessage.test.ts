/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { MockConsoleImplementation } from '@objectiv/testing-tools';
import { LocationContextValidationRule, TrackerConsole, TrackerEvent, TrackerPlatform } from '../src';

TrackerConsole.setImplementation(MockConsoleImplementation);

describe('makeValidationRuleErrorMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it(`should return Core Tracker error message`, () => {
    const rule = new LocationContextValidationRule({
      platform: TrackerPlatform.CORE,
      contextName: 'RootLocationContext',
      once: true,
      position: 0,
    });
    rule.validate(new TrackerEvent({ _type: 'TestEvent' }));
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(2);
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:LocationContextValidationRule｣ Initialized. Context: RootLocationContext.'
    );
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      2,
      '%c｢objectiv｣ Error: RootLocationContext is missing from Location Stack of TestEvent.\n' +
        'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/location-contexts/RootLocationContext.',
      'color:red'
    );
  });

  it(`should return Angular Tracker error message`, () => {
    const rule = new LocationContextValidationRule({
      platform: TrackerPlatform.ANGULAR,
      contextName: 'RootLocationContext',
      once: true,
      position: 0,
    });
    rule.validate(new TrackerEvent({ _type: 'TestEvent' }));
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(2);
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:LocationContextValidationRule｣ Initialized. Context: RootLocationContext.'
    );
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      2,
      '%c｢objectiv｣ Error: RootLocationContext is missing from Location Stack of TestEvent.\n' +
        'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/location-contexts/RootLocationContext.\n' +
        'See also:\n' +
        '- Configuring Roots: https://objectiv.io/docs/tracking/angular/how-to-guides/configuring-root-locations.\n' +
        '- tagRootLocation: https://objectiv.io/docs/tracking/angular/api-reference/locationTaggers/tagRootLocation.',
      'color:red'
    );
  });

  it(`should return Browser Tracker error message`, () => {
    const rule = new LocationContextValidationRule({
      platform: TrackerPlatform.BROWSER,
      contextName: 'RootLocationContext',
      once: true,
      position: 0,
    });
    rule.validate(new TrackerEvent({ _type: 'TestEvent' }));
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(2);
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:LocationContextValidationRule｣ Initialized. Context: RootLocationContext.'
    );
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      2,
      '%c｢objectiv｣ Error: RootLocationContext is missing from Location Stack of TestEvent.\n' +
        'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/location-contexts/RootLocationContext.\n' +
        'See also:\n' +
        '- Configuring Roots: https://objectiv.io/docs/tracking/browser/how-to-guides/configuring-root-locations.\n' +
        '- tagRootLocation: https://objectiv.io/docs/tracking/browser/api-reference/locationTaggers/tagRootLocation.',
      'color:red'
    );
  });

  it(`should return React Tracker error message`, () => {
    const rule = new LocationContextValidationRule({
      platform: TrackerPlatform.REACT,
      contextName: 'RootLocationContext',
      once: true,
      position: 0,
    });
    rule.validate(new TrackerEvent({ _type: 'TestEvent' }));
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(2);
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:LocationContextValidationRule｣ Initialized. Context: RootLocationContext.'
    );
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      2,
      '%c｢objectiv｣ Error: RootLocationContext is missing from Location Stack of TestEvent.\n' +
        'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/location-contexts/RootLocationContext.\n' +
        'See also:\n' +
        '- Configuring Roots: https://objectiv.io/docs/tracking/react/how-to-guides/configuring-root-locations.\n' +
        '- TrackedRootLocationContext: https://objectiv.io/docs/tracking/react/api-reference/trackedContexts/TrackedRootLocationContext.\n' +
        '- RootLocationContextWrapper: https://objectiv.io/docs/tracking/react/api-reference/locationWrappers/RootLocationContextWrapper.',
      'color:red'
    );
  });

  it(`should return React Native Tracker error message`, () => {
    const rule = new LocationContextValidationRule({
      platform: TrackerPlatform.REACT_NATIVE,
      contextName: 'RootLocationContext',
      once: true,
      position: 0,
    });
    rule.validate(new TrackerEvent({ _type: 'TestEvent' }));
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenCalledTimes(2);
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:LocationContextValidationRule｣ Initialized. Context: RootLocationContext.'
    );
    expect(MockConsoleImplementation.groupCollapsed).toHaveBeenNthCalledWith(
      2,
      '%c｢objectiv｣ Error: RootLocationContext is missing from Location Stack of TestEvent.\n' +
        'Taxonomy documentation: https://objectiv.io/docs/taxonomy/reference/location-contexts/RootLocationContext.\n' +
        'See also:\n' +
        '- React Navigation Plugin: https://objectiv.io/docs/tracking/react-native/plugins/react-navigation.\n' +
        '- RootLocationContextWrapper: https://objectiv.io/docs/tracking/react-native/api-reference/locationWrappers/RootLocationContextWrapper.',
      'color:red'
    );
  });
});

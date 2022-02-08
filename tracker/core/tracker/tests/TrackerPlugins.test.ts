/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { mockConsole } from '@objectiv/testing-tools';
import { TrackerEvent, TrackerPluginInterface, TrackerPlugins } from '../src';

describe('Plugin', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should instantiate when specifying an empty list of Plugins', () => {
    const testPlugins = new TrackerPlugins({ plugins: [] });
    expect(testPlugins).toBeInstanceOf(TrackerPlugins);
    expect(testPlugins).toEqual({ plugins: [] });
  });

  it('should instantiate when specifying a list of Plugins instances', () => {
    const plugins: TrackerPluginInterface[] = [
      { pluginName: 'test-pluginA', isUsable: () => true },
      { pluginName: 'test-pluginB', isUsable: () => true },
    ];
    const testPlugins = new TrackerPlugins({ plugins });
    expect(testPlugins).toBeInstanceOf(TrackerPlugins);
    expect(testPlugins).toEqual({ plugins });
  });

  it('should not allow Plugins with the same name', () => {
    class TestPluginA implements TrackerPluginInterface {
      readonly pluginName = 'pluginA';
      readonly parameter?: string;

      constructor(args?: { parameter?: string }) {
        this.parameter = args?.parameter;
      }

      isUsable() {
        return true;
      }
    }
    const TestPluginAFactory = (parameter: string) => new TestPluginA({ parameter });
    const testPlugins = new TrackerPlugins({
      plugins: [
        new TestPluginA(),
        new TestPluginA({ parameter: 'parameterValue1' }),
        TestPluginAFactory('parameterValue2'),
        {
          pluginName: 'pluginA',
          parameter: 'parameterValue3',
          isUsable: () => true,
        } as TrackerPluginInterface,
      ],
      console: mockConsole,
    });
    expect(testPlugins).toBeInstanceOf(TrackerPlugins);
    expect(testPlugins.plugins).toEqual([
      {
        parameter: undefined,
        pluginName: 'pluginA',
      },
    ]);
    expect(mockConsole.error).toHaveBeenCalledTimes(3);
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:TrackerPlugins｣ pluginA: already exists. Use "replace" instead.'
    );
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      2,
      '｢objectiv:TrackerPlugins｣ pluginA: already exists. Use "replace" instead.'
    );
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      3,
      '｢objectiv:TrackerPlugins｣ pluginA: already exists. Use "replace" instead.'
    );
  });

  it('should get a plugin by its name or return null', () => {
    const pluginA = { pluginName: 'test-pluginA', isUsable: () => true };
    const pluginB = { pluginName: 'test-pluginB', isUsable: () => true };
    const testPlugins = new TrackerPlugins({ plugins: [pluginA, pluginB], console: mockConsole });
    expect(testPlugins.get('test-pluginA')).toBe(pluginA);
    expect(testPlugins.get('test-pluginB')).toBe(pluginB);
    expect(testPlugins.get('test-pluginC')).toBe(false);
    expect(mockConsole.error).not.toHaveBeenCalled();
  });

  it('should add plugins', () => {
    const pluginA = { pluginName: 'test-pluginA', isUsable: () => true };
    const pluginB = { pluginName: 'test-pluginB', isUsable: () => true };
    const pluginC = { pluginName: 'test-pluginC', isUsable: () => true };
    const testPlugins = new TrackerPlugins({ plugins: [], console: mockConsole });
    expect(testPlugins.add(pluginA)).toBe(true);
    expect(testPlugins.add(pluginB)).toBe(true);
    expect(testPlugins.add(pluginB)).toBe(false);
    expect(testPlugins.plugins).toEqual([
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginA',
      },
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginB',
      },
    ]);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:TrackerPlugins｣ test-pluginB: already exists. Use "replace" instead.'
    );
    expect(testPlugins.add(pluginC, 1)).toBe(true);
    expect(testPlugins.plugins).toEqual([
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginA',
      },
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginC',
      },
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginB',
      },
    ]);
    expect(testPlugins.add(pluginC, -1)).toBe(false);
    expect(testPlugins.add(pluginC, Infinity)).toBe(false);
    // @ts-ignore
    expect(testPlugins.add(pluginC, '0')).toBe(false);
    expect(mockConsole.error).toHaveBeenCalledTimes(4);
    expect(mockConsole.error).toHaveBeenNthCalledWith(2, '｢objectiv:TrackerPlugins｣ invalid index.');
    expect(mockConsole.error).toHaveBeenNthCalledWith(3, '｢objectiv:TrackerPlugins｣ invalid index.');
    expect(mockConsole.error).toHaveBeenNthCalledWith(4, '｢objectiv:TrackerPlugins｣ invalid index.');
  });

  it('should remove plugins', () => {
    const pluginA = { pluginName: 'test-pluginA', isUsable: () => true };
    const pluginB = { pluginName: 'test-pluginB', isUsable: () => true };
    const pluginC = { pluginName: 'test-pluginC', isUsable: () => true };
    const testPlugins = new TrackerPlugins({ plugins: [pluginA, pluginB, pluginC], console: mockConsole });
    expect(testPlugins.remove('test-pluginB')).toBe(true);
    expect(testPlugins.plugins).toEqual([
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginA',
      },
      {
        isUsable: expect.any(Function),
        pluginName: 'test-pluginC',
      },
    ]);
    expect(testPlugins.remove('test-pluginB')).toBe(false);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenNthCalledWith(1, '｢objectiv:TrackerPlugins｣ test-pluginB: not found.');
  });

  it('should replace plugins', () => {
    const pluginA = { pluginName: 'test-pluginA', isUsable: () => true, parameterA: false };
    const pluginB = { pluginName: 'test-pluginB', isUsable: () => true, parameterB: false };
    const pluginC = { pluginName: 'test-pluginC', isUsable: () => true, parameterC: false };
    const testPlugins = new TrackerPlugins({ plugins: [pluginA, pluginB, pluginC], console: mockConsole });
    expect(testPlugins.plugins).toEqual([
      {
        parameterA: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginA',
      },
      {
        parameterB: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginB',
      },
      {
        parameterC: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginC',
      },
    ]);
    const newPluginB1 = { pluginName: 'test-pluginB', isUsable: () => true, parameterB: true };
    expect(testPlugins.replace(newPluginB1)).toBe(true);
    expect(testPlugins.plugins).toEqual([
      {
        parameterA: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginA',
      },
      {
        parameterB: true,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginB',
      },
      {
        parameterC: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginC',
      },
    ]);
    const newPluginD = { pluginName: 'test-pluginD', isUsable: () => true };
    expect(testPlugins.replace(newPluginD)).toBe(false);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenNthCalledWith(1, '｢objectiv:TrackerPlugins｣ test-pluginD: not found.');
    const newPluginB2 = { pluginName: 'test-pluginB', isUsable: () => true, newParameter: { a: 1 } };
    expect(testPlugins.replace(newPluginB2, 0)).toBe(true);
    expect(testPlugins.plugins).toEqual([
      {
        isUsable: expect.any(Function),
        newParameter: { a: 1 },
        pluginName: 'test-pluginB',
      },
      {
        parameterA: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginA',
      },
      {
        parameterC: false,
        isUsable: expect.any(Function),
        pluginName: 'test-pluginC',
      },
    ]);
    expect(testPlugins.replace(newPluginB2, -1)).toBe(false);
    expect(testPlugins.replace(newPluginB2, Infinity)).toBe(false);
    // @ts-ignore
    expect(testPlugins.replace(newPluginB2, '0')).toBe(false);
    expect(mockConsole.error).toHaveBeenCalledTimes(4);
    expect(mockConsole.error).toHaveBeenNthCalledWith(2, '｢objectiv:TrackerPlugins｣ invalid index.');
    expect(mockConsole.error).toHaveBeenNthCalledWith(3, '｢objectiv:TrackerPlugins｣ invalid index.');
    expect(mockConsole.error).toHaveBeenNthCalledWith(4, '｢objectiv:TrackerPlugins｣ invalid index.');
  });

  it('constructor should behave like `add`', () => {
    class TestPluginA implements TrackerPluginInterface {
      readonly pluginName = 'pluginA';
      readonly parameter?: string;

      constructor(args?: { parameter?: string }) {
        this.parameter = args?.parameter;
      }

      isUsable() {
        return true;
      }
    }
    const TestPluginAFactory = (parameter: string) => new TestPluginA({ parameter });
    const testPlugins = new TrackerPlugins({
      plugins: [
        new TestPluginA(),
        new TestPluginA({ parameter: 'parameterValue' }),
        TestPluginAFactory('parameterValue'),
        {
          pluginName: 'pluginA',
          parameter: 'parameterValue',
          isUsable: () => true,
        } as TrackerPluginInterface,
      ],
      console: mockConsole,
    });
    expect(testPlugins).toBeInstanceOf(TrackerPlugins);
    expect(testPlugins.plugins).toEqual([
      {
        parameter: undefined,
        pluginName: 'pluginA',
      },
    ]);
    expect(mockConsole.error).toHaveBeenCalledTimes(3);
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      1,
      '｢objectiv:TrackerPlugins｣ pluginA: already exists. Use "replace" instead.'
    );
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      2,
      '｢objectiv:TrackerPlugins｣ pluginA: already exists. Use "replace" instead.'
    );
    expect(mockConsole.error).toHaveBeenNthCalledWith(
      3,
      '｢objectiv:TrackerPlugins｣ pluginA: already exists. Use "replace" instead.'
    );
  });

  it('should execute all Plugins implementing the `beforeTransport` callback', () => {
    const pluginA: TrackerPluginInterface = {
      pluginName: 'pluginA',
      isUsable: () => true,
      beforeTransport: jest.fn(),
    };
    const pluginB: TrackerPluginInterface = {
      pluginName: 'pluginB',
      isUsable: () => true,
      beforeTransport: jest.fn(),
    };
    const pluginC: TrackerPluginInterface = { pluginName: 'pluginC', isUsable: () => true };
    const plugins: TrackerPluginInterface[] = [pluginA, pluginB, pluginC];
    const testPlugins = new TrackerPlugins({ plugins });
    expect(pluginA.beforeTransport).not.toHaveBeenCalled();
    expect(pluginB.beforeTransport).not.toHaveBeenCalled();
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    testPlugins.beforeTransport(testEvent);
    expect(pluginA.beforeTransport).toHaveBeenCalledWith(testEvent);
    expect(pluginB.beforeTransport).toHaveBeenCalledWith(testEvent);
  });

  it('should execute only Plugins that are usable', () => {
    const pluginA: TrackerPluginInterface = {
      pluginName: 'pluginA',
      isUsable: () => true,
      beforeTransport: jest.fn(),
    };
    const pluginB: TrackerPluginInterface = {
      pluginName: 'test-pluginB',
      isUsable: () => false,
      beforeTransport: jest.fn(),
    };
    const pluginC: TrackerPluginInterface = {
      pluginName: 'pluginC',
      isUsable: () => true,
      beforeTransport: jest.fn(),
    };
    const plugins: TrackerPluginInterface[] = [pluginA, pluginB, pluginC];
    const testPlugins = new TrackerPlugins({ plugins });
    expect(pluginA.beforeTransport).not.toHaveBeenCalled();
    expect(pluginB.beforeTransport).not.toHaveBeenCalled();
    expect(pluginC.beforeTransport).not.toHaveBeenCalled();
    const testEvent = new TrackerEvent({ _type: 'test-event' });
    testPlugins.beforeTransport(testEvent);
    expect(pluginA.beforeTransport).toHaveBeenCalledWith(testEvent);
    expect(pluginB.beforeTransport).not.toHaveBeenCalled();
    expect(pluginC.beforeTransport).toHaveBeenCalledWith(testEvent);
  });
});

import { renderHook } from '@testing-library/react-hooks';
import { useOnUnmount } from '../src';

describe('useOnUnmount', () => {
  const mockEffectCallback = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should not execute on mount', () => {
    renderHook((effectCallback) => useOnUnmount(effectCallback), { initialProps: mockEffectCallback });
    expect(mockEffectCallback).not.toHaveBeenCalled();
  });

  it('should not execute on rerender', () => {
    const hook = renderHook((effectCallback) => useOnUnmount(effectCallback), { initialProps: mockEffectCallback });
    expect(mockEffectCallback).not.toHaveBeenCalled();
    hook.rerender();
    hook.rerender();
    hook.rerender();
    expect(mockEffectCallback).not.toHaveBeenCalled();
  });

  it('should execute on unmount', () => {
    const hook = renderHook((effectCallback) => useOnUnmount(effectCallback), { initialProps: mockEffectCallback });
    expect(mockEffectCallback).not.toHaveBeenCalled();
    hook.unmount();
    expect(mockEffectCallback).toHaveBeenCalledTimes(1);
  });

  it('should execute the latest version of of the effect callback', () => {
    const mockEffectCallback2 = jest.fn();
    const mockEffectCallback3 = jest.fn();
    const mockEffectCallback4 = jest.fn();
    const hook = renderHook((effectCallback) => useOnUnmount(effectCallback), { initialProps: mockEffectCallback });

    hook.rerender(mockEffectCallback2);
    hook.rerender(mockEffectCallback3);
    hook.rerender(mockEffectCallback4);
    hook.unmount();

    expect(mockEffectCallback).not.toHaveBeenCalled();
    expect(mockEffectCallback2).not.toHaveBeenCalled();
    expect(mockEffectCallback3).not.toHaveBeenCalled();
    expect(mockEffectCallback4).toHaveBeenCalledTimes(1);
  });
});

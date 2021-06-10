import { renderHook } from '@testing-library/react-hooks';
import { useOnMount } from '../src';

describe('useOnMount', () => {
  const mockEffectCallback = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should execute once on mount', () => {
    renderHook(() => useOnMount(mockEffectCallback));
    expect(mockEffectCallback).toHaveBeenCalledTimes(1);
  });

  it('should not execute on unmount', () => {
    const hook = renderHook(() => useOnMount(mockEffectCallback));
    expect(mockEffectCallback).toHaveBeenCalledTimes(1);
    hook.unmount();
    expect(mockEffectCallback).toHaveBeenCalledTimes(1);
  });

  it('should not execute on rerender', () => {
    const hook = renderHook(() => useOnMount(mockEffectCallback));
    expect(mockEffectCallback).toHaveBeenCalledTimes(1);
    hook.rerender();
    hook.rerender();
    hook.rerender();
    expect(mockEffectCallback).toHaveBeenCalledTimes(1);
  });
});

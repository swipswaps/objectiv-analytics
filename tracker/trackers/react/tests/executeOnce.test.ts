/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { executeOnce } from '../src/';

describe('executeOnce', () => {
  it('should execute the given function only once', () => {
    const spy = jest.fn();
    const once = executeOnce(spy);

    once(123);
    once(456);
    once(789);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenNthCalledWith(1, 123);
  });
});

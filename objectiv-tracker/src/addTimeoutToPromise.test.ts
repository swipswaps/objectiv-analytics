import { addTimeoutToPromise } from './addTimeoutToPromise';

describe('timeout', () => {
  it(`rejects when promise doesn't resolve in time`, async () => {
    const brokenPromise = new Promise(() => {});
    const promiseWithTimeout = addTimeoutToPromise(brokenPromise, 100);
    await expect(promiseWithTimeout).rejects.toThrow('timeout');
  });

  it('resolves with the correct value', async () => {
    const goodPromise = Promise.resolve('foo');
    const promiseWithTimeout = addTimeoutToPromise(goodPromise, 100);
    await expect(promiseWithTimeout).resolves.toBe('foo');
  });

  it('rejects with the correct value', async () => {
    const rejectedPromise = Promise.reject(new Error('kapot'));
    const promiseWithTimeout = addTimeoutToPromise(rejectedPromise, 100);
    await expect(promiseWithTimeout).rejects.toThrow('kapot');
  });
});

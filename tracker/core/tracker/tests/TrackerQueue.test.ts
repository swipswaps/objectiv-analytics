import { TrackerEvent, TrackerQueue, TrackerQueueMemoryStore } from '../src';

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('TrackerQueue', () => {
  const TrackerEvent1 = new TrackerEvent({ event: 'a' });
  const TrackerEvent2 = new TrackerEvent({ event: 'b' });
  const TrackerEvent3 = new TrackerEvent({ event: 'c' });

  it('should instantiate to a 0 length Queue', () => {
    const testQueue = new TrackerQueue();
    expect(testQueue.store.length).toBe(0);
  });

  it('should allow enqueuing multiple items at once', () => {
    const testQueue = new TrackerQueue();
    testQueue.push(TrackerEvent1, TrackerEvent2, TrackerEvent3);
    expect(testQueue.store.length).toBe(3);
  });

  it('should enqueue and dequeue in the expected order', () => {
    const testQueue = new TrackerQueue({ batchSize: 1, batchDelayMs: 100, store: new TrackerQueueMemoryStore() });
    expect(testQueue.store.length).toBe(0);

    testQueue.push(TrackerEvent1);
    expect(testQueue.store.length).toBe(1);

    testQueue.push(TrackerEvent2);
    expect(testQueue.store.length).toBe(2);

    testQueue.push(TrackerEvent3);
    expect(testQueue.store.length).toBe(3);

    const runFunctionSpy = jest.fn();
    testQueue.run(runFunctionSpy);

    jest.advanceTimersByTime(testQueue.batchDelayMs);

    expect(runFunctionSpy).toHaveBeenCalledWith(TrackerEvent1);
    expect(testQueue.store.length).toBe(2);

    runFunctionSpy.mockReset();
    jest.advanceTimersByTime(testQueue.batchDelayMs);

    expect(runFunctionSpy).toHaveBeenCalledWith(TrackerEvent2);
    expect(testQueue.store.length).toBe(1);

    runFunctionSpy.mockReset();
    jest.advanceTimersByTime(testQueue.batchDelayMs);

    expect(runFunctionSpy).toHaveBeenCalledWith(TrackerEvent3);
    expect(testQueue.store.length).toBe(0);
  });

  it('should support batches', () => {
    const testQueue = new TrackerQueue({ batchSize: 2 });
    testQueue.push(TrackerEvent1);
    testQueue.push(TrackerEvent2);
    testQueue.push(TrackerEvent3);
    expect(testQueue.store.length).toBe(3);

    const runFunctionSpy = jest.fn();
    testQueue.run(runFunctionSpy);

    jest.advanceTimersByTime(testQueue.batchDelayMs);

    expect(runFunctionSpy).toHaveBeenCalledWith(...[TrackerEvent1, TrackerEvent2]);
    expect(testQueue.store.length).toBe(1);

    runFunctionSpy.mockReset();
    jest.advanceTimersByTime(testQueue.batchDelayMs);

    expect(runFunctionSpy).toHaveBeenCalledWith(TrackerEvent3);
    expect(testQueue.store.length).toBe(0);
  });
});

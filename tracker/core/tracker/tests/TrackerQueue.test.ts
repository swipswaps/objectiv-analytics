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

  it('should allow setting batchSize and batchDelayMs', () => {
    const testQueue = new TrackerQueue({ batchSize: 123, batchDelayMs: 456 });
    expect(testQueue.batchSize).toBe(123);
    expect(testQueue.batchDelayMs).toBe(456);
  });

  it('should throw an exception if the processFunction has not been set', () => {
    const testQueue = new TrackerQueue({ batchSize: 1 });
    expect(() => {
      testQueue.run();
    }).toThrow('TrackerQueue `processFunction` has not been set.');
  });

  it('should enqueue and dequeue in the expected order', () => {
    const processFunctionSpy = jest.fn();
    const memoryStore = new TrackerQueueMemoryStore();
    const testQueue = new TrackerQueue({ batchSize: 1, store: memoryStore });
    testQueue.setProcessFunction(processFunctionSpy);
    expect(testQueue.store.length).toBe(0);

    testQueue.push(TrackerEvent1);
    expect(memoryStore.length).toBe(1);

    testQueue.push(TrackerEvent2);
    expect(memoryStore.length).toBe(2);

    testQueue.push(TrackerEvent3);
    expect(memoryStore.length).toBe(3);

    testQueue.run();

    expect(processFunctionSpy).toHaveBeenCalledWith(TrackerEvent1);
    expect(memoryStore.length).toBe(2);

    processFunctionSpy.mockReset();
    testQueue.run();

    expect(processFunctionSpy).toHaveBeenCalledWith(TrackerEvent2);
    expect(memoryStore.length).toBe(1);

    processFunctionSpy.mockReset();
    testQueue.run();

    expect(processFunctionSpy).toHaveBeenCalledWith(TrackerEvent3);
    expect(memoryStore.length).toBe(0);
  });

  it('should support batches', () => {
    const processFunctionSpy = jest.fn();
    const testQueue = new TrackerQueue({ batchSize: 2 });
    testQueue.setProcessFunction(processFunctionSpy);
    testQueue.push(TrackerEvent1);
    testQueue.push(TrackerEvent2);
    testQueue.push(TrackerEvent3);
    expect(testQueue.store.length).toBe(3);

    testQueue.run();

    expect(processFunctionSpy).toHaveBeenCalledWith(...[TrackerEvent1, TrackerEvent2]);
    expect(testQueue.store.length).toBe(1);

    processFunctionSpy.mockReset();
    testQueue.run();

    expect(processFunctionSpy).toHaveBeenCalledWith(TrackerEvent3);
    expect(testQueue.store.length).toBe(0);
  });
});

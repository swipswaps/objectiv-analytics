import { TrackerEvent, TrackerMemoryQueue } from '../src';

describe('TrackerMemoryQueue', () => {
  const TrackerEvent1 = new TrackerEvent({ eventName: 'a' });
  const TrackerEvent2 = new TrackerEvent({ eventName: 'b' });
  const TrackerEvent3 = new TrackerEvent({ eventName: 'c' });

  it('should instantiate to a 0 length Queue', () => {
    const testQueue = new TrackerMemoryQueue();
    expect(testQueue.events).toHaveLength(0);
  });

  it('should allow enqueuing multiple items at once', () => {
    const testQueue = new TrackerMemoryQueue();
    testQueue.enqueue(TrackerEvent1, TrackerEvent2, TrackerEvent3);
    expect(testQueue.events).toHaveLength(3);
  });

  it('should allow duplicated items', () => {
    const testQueue = new TrackerMemoryQueue();
    testQueue.enqueue(TrackerEvent1);
    expect(testQueue.events).toHaveLength(1);

    testQueue.enqueue(TrackerEvent1);
    expect(testQueue.events).toHaveLength(2);
  });

  it('should enqueue and dequeue in the expected order', () => {
    const testQueue = new TrackerMemoryQueue();
    testQueue.enqueue(TrackerEvent1);
    expect(testQueue.events).toHaveLength(1);

    testQueue.enqueue(TrackerEvent2);
    expect(testQueue.events).toHaveLength(2);

    testQueue.enqueue(TrackerEvent3);
    expect(testQueue.events).toHaveLength(3);

    expect(testQueue.dequeue()).toStrictEqual([TrackerEvent1]);
    expect(testQueue.events).toHaveLength(2);
    expect(testQueue.dequeue()).toStrictEqual([TrackerEvent2]);
    expect(testQueue.events).toHaveLength(1);
    expect(testQueue.dequeue()).toStrictEqual([TrackerEvent3]);
    expect(testQueue.events).toHaveLength(0);
    expect(testQueue.dequeue()).toStrictEqual([]);
  });

  it('should support dequeue in batches', () => {
    const testQueue = new TrackerMemoryQueue();
    testQueue.enqueue(TrackerEvent1);
    testQueue.enqueue(TrackerEvent2);
    testQueue.enqueue(TrackerEvent3);
    expect(testQueue.events).toHaveLength(3);

    expect(testQueue.dequeue(2)).toStrictEqual([TrackerEvent1, TrackerEvent2]);
    expect(testQueue.events).toHaveLength(1);
    expect(testQueue.dequeue(3)).toStrictEqual([TrackerEvent3]);
    expect(testQueue.events).toHaveLength(0);
    expect(testQueue.dequeue(5)).toStrictEqual([]);
  });

  it('should run 3 batches', () => {
    jest.useFakeTimers();

    // Create a MemoryQueue configured to have batches smaller than the full Queue size
    const QUEUE_SIZE = 25;
    const testQueue = new TrackerMemoryQueue({ batchSize: 10, batchDelayMs: 100 });
    [...Array(QUEUE_SIZE)].forEach(() => testQueue.enqueue(TrackerEvent1));

    // A spy runFunction we can monitor
    const spyRunFunction = jest.fn(async (...items: TrackerEvent[]) => {
      console.log(items);
    });

    // At this point the Queue should be full and the runFunction should have never been called
    expect(testQueue.events.length).toBe(QUEUE_SIZE);
    expect(spyRunFunction).not.toHaveBeenCalled();

    // Start running the queue, this should start the interval timer
    testQueue.run(spyRunFunction);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), testQueue.batchDelayMs);

    // Run all timers by one tick - 1st Batch
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Queue size should have gone down by the batch size and runFunction should have been called
    expect(testQueue.events.length).toBe(QUEUE_SIZE - testQueue.batchSize);
    expect(spyRunFunction).toHaveBeenCalledTimes(1);
    expect(spyRunFunction).toHaveBeenCalledWith(...[...Array(testQueue.batchSize)].map(() => TrackerEvent1));

    // Run all timers by one tick - 2nd Batch
    spyRunFunction.mockClear();
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Queue size should have gone down by the batch size and runFunction should have been called
    expect(testQueue.events.length).toBe(QUEUE_SIZE - testQueue.batchSize * 2);
    expect(spyRunFunction).toHaveBeenCalledTimes(1);
    expect(spyRunFunction).toHaveBeenCalledWith(...[...Array(testQueue.batchSize)].map(() => TrackerEvent1));

    // Run all timers by one tick - 3nd Batch
    spyRunFunction.mockClear();
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Queue should be empty by now and the runFunction should have received the last, smaller, batch
    expect(testQueue.events.length).toBe(0);
    expect(spyRunFunction).toHaveBeenCalledTimes(1);
    expect(spyRunFunction).toHaveBeenCalledWith(
      ...[...Array(QUEUE_SIZE - testQueue.batchSize * 2)].map(() => TrackerEvent1)
    );

    // Run all timers by one tick - Noop
    spyRunFunction.mockClear();
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Nothing should have happened
    expect(testQueue.events.length).toBe(0);
    expect(spyRunFunction).toHaveBeenCalledTimes(0);
    expect(spyRunFunction).not.toHaveBeenCalled();
  });
});

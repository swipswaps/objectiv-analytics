import { MemoryQueue } from '../src';

describe('Queue', () => {
  const Item1 = { property: 'a' };
  const Item2 = { property: 'b' };
  const Item3 = { property: 'c' };

  it('should instantiate to a 0 length Queue', () => {
    const testQueue = new MemoryQueue();
    expect(testQueue).toHaveLength(0);
  });

  it('should allow duplicated items', () => {
    const testQueue = new MemoryQueue();
    testQueue.enqueue(Item1);
    expect(testQueue).toHaveLength(1);

    testQueue.enqueue(Item1);
    expect(testQueue).toHaveLength(2);
  });

  it('should enqueue and dequeue in the expected order', () => {
    const testQueue = new MemoryQueue();
    testQueue.enqueue(Item1);
    expect(testQueue).toHaveLength(1);

    testQueue.enqueue(Item2);
    expect(testQueue).toHaveLength(2);

    testQueue.enqueue(Item3);
    expect(testQueue).toHaveLength(3);

    expect(testQueue.dequeue()).toStrictEqual([Item1]);
    expect(testQueue).toHaveLength(2);
    expect(testQueue.dequeue()).toStrictEqual([Item2]);
    expect(testQueue).toHaveLength(1);
    expect(testQueue.dequeue()).toStrictEqual([Item3]);
    expect(testQueue).toHaveLength(0);
    expect(testQueue.dequeue()).toStrictEqual([]);
  });

  it('should support dequeue in batches', () => {
    const testQueue = new MemoryQueue();
    testQueue.enqueue(Item1);
    testQueue.enqueue(Item2);
    testQueue.enqueue(Item3);
    expect(testQueue).toHaveLength(3);

    expect(testQueue.dequeue(2)).toStrictEqual([Item1, Item2]);
    expect(testQueue).toHaveLength(1);
    expect(testQueue.dequeue(3)).toStrictEqual([Item3]);
    expect(testQueue).toHaveLength(0);
    expect(testQueue.dequeue(5)).toStrictEqual([]);
  });

  it('should run 3 batches', () => {
    jest.useFakeTimers();

    // Create a MemoryQueue configured to have batches smaller than the full Queue size
    const QUEUE_SIZE = 25;
    const testQueue = new MemoryQueue({ batchSize: 10, batchDelayMs: 100 });
    [...Array(QUEUE_SIZE)].forEach(() => testQueue.enqueue(Item1));

    // A spy runFunction we can monitor
    const spyRunFunction = jest.fn(async (items: unknown[]) => {
      console.log(items);
    });

    // At this point the Queue should be full and the runFunction should have never been called
    expect(testQueue.length).toBe(QUEUE_SIZE);
    expect(spyRunFunction).not.toHaveBeenCalled();

    // Start running the queue, this should start the interval timer
    testQueue.run(spyRunFunction);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), testQueue.batchDelayMs);

    // Run all timers by one tick - 1st Batch
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Queue size should have gone down by the batch size and runFunction should have been called
    expect(testQueue.length).toBe(QUEUE_SIZE - testQueue.batchSize);
    expect(spyRunFunction).toHaveBeenCalledTimes(1);
    expect(spyRunFunction).toHaveBeenCalledWith([...Array(testQueue.batchSize)].map(() => Item1));

    // Run all timers by one tick - 2nd Batch
    spyRunFunction.mockClear();
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Queue size should have gone down by the batch size and runFunction should have been called
    expect(testQueue.length).toBe(QUEUE_SIZE - testQueue.batchSize * 2);
    expect(spyRunFunction).toHaveBeenCalledTimes(1);
    expect(spyRunFunction).toHaveBeenCalledWith([...Array(testQueue.batchSize)].map(() => Item1));

    // Run all timers by one tick - 3nd Batch
    spyRunFunction.mockClear();
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Queue should be empty by now and the runFunction should have received the last, smaller, batch
    expect(testQueue.length).toBe(0);
    expect(spyRunFunction).toHaveBeenCalledTimes(1);
    expect(spyRunFunction).toHaveBeenCalledWith([...Array(QUEUE_SIZE - testQueue.batchSize * 2)].map(() => Item1));

    // Run all timers by one tick - Noop
    spyRunFunction.mockClear();
    jest.runTimersToTime(testQueue.batchDelayMs);

    // Nothing should have happened
    expect(testQueue.length).toBe(0);
    expect(spyRunFunction).toHaveBeenCalledTimes(0);
    expect(spyRunFunction).not.toHaveBeenCalled();
  });
});

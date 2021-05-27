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
});

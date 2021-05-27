import { MemoryQueue, Queueable } from '../src';

describe('Queue', () => {
  const Item1: Queueable = { a: 'b' };
  const Item2: Queueable = { a: 'c' };
  const Item3: Queueable = { b: 'd' };

  it('should instantiate to a 0 length Queue', () => {
    const testQueue = new MemoryQueue();
    expect(testQueue).toHaveLength(0);
  });

  it('should allow instantiating with one or more Queueable items', () => {
    const testQueue1 = new MemoryQueue(Item1);
    expect(testQueue1).toHaveLength(1);

    const testQueue2 = new MemoryQueue(Item1, Item2, Item3);
    expect(testQueue2).toHaveLength(3);
  });

  it('should allow duplicated items', () => {
    const testQueue1 = new MemoryQueue(Item1, Item1);
    expect(testQueue1).toHaveLength(2);

    testQueue1.enqueue(Item1);
    expect(testQueue1).toHaveLength(3);
  });

  it('should enqueue and dequeue in the expected order', () => {
    const testQueue1 = new MemoryQueue(Item1);
    expect(testQueue1).toHaveLength(1);

    testQueue1.enqueue(Item2);
    expect(testQueue1).toHaveLength(2);

    testQueue1.enqueue(Item3);
    expect(testQueue1).toHaveLength(3);

    expect(testQueue1.dequeue()).toStrictEqual([Item1]);
    expect(testQueue1).toHaveLength(2);
    expect(testQueue1.dequeue()).toStrictEqual([Item2]);
    expect(testQueue1).toHaveLength(1);
    expect(testQueue1.dequeue()).toStrictEqual([Item3]);
    expect(testQueue1).toHaveLength(0);
    expect(testQueue1.dequeue()).toStrictEqual([]);
  });

  it('should support dequeue in batches', () => {
    const testQueue1 = new MemoryQueue(Item1, Item2, Item3);
    expect(testQueue1).toHaveLength(3);

    expect(testQueue1.dequeue(2)).toStrictEqual([Item1, Item2]);
    expect(testQueue1).toHaveLength(1);
    expect(testQueue1.dequeue(3)).toStrictEqual([Item3]);
    expect(testQueue1).toHaveLength(0);
    expect(testQueue1.dequeue(5)).toStrictEqual([]);
  });

});

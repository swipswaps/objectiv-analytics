import { MemorySessionRepository } from './MemorySessionRepository';
import { v4 as uuid } from 'uuid';

describe('MemorySessionRepository', () => {
  it('stores and retrieves session id', async () => {
    const TEST_ID = uuid();
    const repository = new MemorySessionRepository();
    await repository.storeSessionId(TEST_ID);

    expect(await repository.getSessionId()).toBe(TEST_ID);
  });

  it('optionally creates a new id if none exists', async () => {
    const repository = new MemorySessionRepository();

    const sessionId = await repository.getOrCreateSessionId();
    expect(sessionId).toEqual(expect.any(String));

    const sessionId2 = await repository.getOrCreateSessionId();
    expect(sessionId).toBe(sessionId2);
  });
});

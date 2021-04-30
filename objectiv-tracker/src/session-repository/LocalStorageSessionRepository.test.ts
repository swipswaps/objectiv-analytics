import { LocalStorageSessionRepository } from './LocalStorageSessionRepository';
import { v4 as uuid } from 'uuid';

describe('LocalStorageSessionRepository', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores a session id', async () => {
    const TEST_ID = uuid();
    const repository = new LocalStorageSessionRepository('test');
    await repository.storeSessionId(TEST_ID);

    expect(localStorage.getItem('test-session-id')).toBe(TEST_ID);
  });

  it('retrieves a session id', async () => {
    const TEST_ID = uuid();
    const repository = new LocalStorageSessionRepository('test');
    await repository.storeSessionId(TEST_ID);

    expect(await repository.getSessionId()).toBe(TEST_ID);
  });

  it('optionally creates a new id if none exists', async () => {
    const repository = new LocalStorageSessionRepository('test');

    const sessionId = await repository.getOrCreateSessionId();
    expect(sessionId).toEqual(expect.any(String));

    const sessionId2 = await repository.getOrCreateSessionId();
    expect(sessionId).toBe(sessionId2);
  });
});

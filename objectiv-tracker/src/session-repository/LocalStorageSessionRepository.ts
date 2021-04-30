import { SessionRepositoryInterface } from './SessionRepositoryInterface';
import { v4 as uuid } from 'uuid';

export class LocalStorageSessionRepository implements SessionRepositoryInterface {
  constructor(private readonly prefix: string = 'objectiv') {}

  async getSessionId() {
    return localStorage.getItem(`${this.prefix}-session-id`);
  }

  async storeSessionId(sessionId: string) {
    localStorage.setItem(`${this.prefix}-session-id`, sessionId);
  }

  async getOrCreateSessionId() {
    let sessionId = await this.getSessionId();

    if (!sessionId) {
      sessionId = uuid();
      await this.storeSessionId(sessionId);
    }

    return sessionId;
  }
}

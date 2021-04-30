import { SessionRepositoryInterface } from './SessionRepositoryInterface';
import { v4 as uuid } from 'uuid';

export class MemorySessionRepository implements SessionRepositoryInterface {
  private sessionId: string;

  async getSessionId() {
    return this.sessionId;
  }

  async storeSessionId(sessionId: string) {
    this.sessionId = sessionId;
  }

  async getOrCreateSessionId() {
    if (!this.sessionId) {
      this.sessionId = uuid();
    }

    return this.sessionId;
  }
}

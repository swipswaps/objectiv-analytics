import fetchMock from 'jest-fetch-mock';
import { clear, mockUserAgent } from 'jest-useragent-mock';
import { WebTracker } from './WebTracker';
import { TrackerEvent } from './Tracker';

describe('WebTracker', () => {
  const MOCK_ENDPOINT = 'https://mock-endpoint';

  beforeAll(() => {
    mockUserAgent('i-am-an-user-agent-honest');
    fetchMock.enableMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  afterAll(() => {
    clear();
  });

  it('tracks WebDocumentContext automatically', async () => {
    const MOCK_EVENT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
      ],
      location_stack: [],
    };

    const EXPECTED_RESULT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
      ],
      location_stack: [
        {
          _context_type: 'WebDocumentContext',
          id: 'test-tracker',
          url: 'http://localhost/',
        },
      ],
    };

    const tracker = new WebTracker({
      id: 'test-tracker',
      trackWebDocument: true,
      trackDevice: false,
      endpoint: MOCK_ENDPOINT,
    });

    await tracker.trackEvent(MOCK_EVENT);

    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([EXPECTED_RESULT]),
      })
    );
  });

  it('tracks DeviceContext automatically', async () => {
    const MOCK_EVENT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [],
      location_stack: [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
      ],
    };

    const EXPECTED_RESULT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [
        {
          _context_type: 'DeviceContext',
          id: 'device',
          'user-agent': 'i-am-an-user-agent-honest',
        },
      ],
      location_stack: [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
      ],
    };

    const tracker = new WebTracker({
      id: 'test-tracker',
      trackWebDocument: false,
      trackDevice: true,
      endpoint: MOCK_ENDPOINT,
    });

    await tracker.trackEvent(MOCK_EVENT);

    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([EXPECTED_RESULT]),
      })
    );
  });
});

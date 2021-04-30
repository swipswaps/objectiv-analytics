import fetchMock from 'jest-fetch-mock';
import { clear, mockUserAgent } from 'jest-useragent-mock';
import { TestContext } from './contexts';
import { TrackerEvent, Tracker } from './Tracker';

describe('Tracker', () => {
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

  it('posts events to endpoint', async () => {
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

    const tracker = new Tracker({ endpoint: MOCK_ENDPOINT });

    await tracker.trackEvent(MOCK_EVENT);

    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([MOCK_EVENT]),
      })
    );
  });

  it('resolves promised contexts', async () => {
    const MOCK_EVENT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
        Promise.resolve<TestContext>({
          _context_type: 'TestContext',
          foo: 'promised',
        }),
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
        {
          _context_type: 'TestContext',
          foo: 'promised',
        },
      ],
      location_stack: [],
    };

    const tracker = new Tracker({ endpoint: MOCK_ENDPOINT });

    await tracker.trackEvent(MOCK_EVENT);

    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([EXPECTED_RESULT]),
      })
    );
  });

  it('resolves context factories', async () => {
    const MOCK_EVENT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
        () => ({
          _context_type: 'TestContext',
          foo: 'promised',
        }),
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
        {
          _context_type: 'TestContext',
          foo: 'promised',
        },
      ],
      location_stack: [],
    };

    const tracker = new Tracker({ endpoint: MOCK_ENDPOINT });

    await tracker.trackEvent(MOCK_EVENT);

    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([EXPECTED_RESULT]),
      })
    );
  });
});

import fetchMock from 'jest-fetch-mock';
import { StackDecorator } from './StackDecorator';
import { TrackerEvent, Tracker } from './Tracker';

describe('StackDecorator', () => {
  const MOCK_ENDPOINT = 'https://mock-endpoint';

  beforeAll(() => {
    fetchMock.enableMocks();
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('adds contexts to all emitted events', async () => {
    const tracker = new Tracker({ endpoint: MOCK_ENDPOINT });
    const decoratedTracker = new StackDecorator(
      tracker,
      [
        {
          _context_type: 'TestContext',
          foo: 'bar',
        },
      ],
      []
    );

    const MOCK_EVENT: TrackerEvent = {
      event: 'TestEvent',
      global_contexts: [],
      location_stack: [],
    };

    await decoratedTracker.trackEvent(MOCK_EVENT);

    expect(fetch).toHaveBeenCalledWith(
      MOCK_ENDPOINT,
      expect.objectContaining({
        body: JSON.stringify([
          {
            event: 'TestEvent',
            global_contexts: [
              {
                _context_type: 'TestContext',
                foo: 'bar',
              },
            ],
            location_stack: [],
          },
        ]),
      })
    );
  });
});

import { makeDeviceContext, makeDocumentLoadedEvent, makeSectionContext, makeURLChangedEvent } from '../src';

const sectionA = makeSectionContext({ id: 'A' });
const device = makeDeviceContext({ userAgent: '123' });

describe('Event Factories', () => {
  it('DocumentLoadedEvent', () => {
    expect(makeDocumentLoadedEvent()).toStrictEqual({
      _interactive_event: false,
      event: 'DocumentLoadedEvent',
      globalContexts: [],
      locationStack: [],
    });

    expect(makeDocumentLoadedEvent({ locationStack: [sectionA], globalContexts: [device] })).toStrictEqual({
      _interactive_event: false,
      event: 'DocumentLoadedEvent',
      globalContexts: [device],
      locationStack: [sectionA],
    });
  });

  it('URLChangedEvent', () => {
    expect(makeURLChangedEvent()).toStrictEqual({
      _interactive_event: false,
      event: 'URLChangedEvent',
      globalContexts: [],
      locationStack: [],
    });

    expect(makeURLChangedEvent({ locationStack: [sectionA], globalContexts: [device] })).toStrictEqual({
      _interactive_event: false,
      event: 'URLChangedEvent',
      globalContexts: [device],
      locationStack: [sectionA],
    });
  });
});

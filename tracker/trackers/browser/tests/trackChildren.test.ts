import { trackChild, trackElement, TrackingAttribute } from '../src';

describe('trackChildren', () => {
  it('should return query and trackAs attributes', () => {
    const parameters = { query: '#two', trackAs: trackElement({ id: 'element-two' }) };
    expect(trackChild(parameters)).toStrictEqual({
      [TrackingAttribute.trackChildren]: JSON.stringify([parameters]),
    });
  });
});

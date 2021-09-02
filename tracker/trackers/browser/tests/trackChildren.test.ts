import { ChildrenTrackingAttribute, trackChild, trackElement } from '../src';

describe('trackChildren', () => {
  it('should return query and trackAs attributes', () => {
    const parameters = { query: '#two', trackAs: trackElement({ id: 'element-two' }) };
    expect(trackChild(parameters)).toStrictEqual({
      [ChildrenTrackingAttribute.trackChildren]: JSON.stringify([parameters]),
    });
  });
});

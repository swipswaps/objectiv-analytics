import { getElementLocationStack } from '../src/tracker/getElementLocationStack';

describe('getElementLocationStack', () => {
  afterEach(() => {
    jest.resetAllMocks();
    document.getElementsByTagName('html')[0].innerHTML = '';
  });

  it('should console.error', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-ignore
    expect(getElementLocationStack(null)).toHaveLength(0);
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  // TODO exhaustive testing
});

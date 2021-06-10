import { makeSectionContext } from '@objectiv/tracker-core';
import { render } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';
import { ReactTracker, TrackerContextProvider, TrackerSection, useTracker } from '../src';

describe('TrackerSection', () => {
  beforeAll(() => {
    fetchMock.enableMocks();
  });

  it('should retrieve the tracker from the closest TrackerContextProviders', () => {
    const root = new ReactTracker({ endpoint: '/collector', locationStack: [makeSectionContext({ id: 'root' })] });

    const spy = jest.fn();

    const TrackingComponent = ({ id }: { id: string }) => {
      const tracker = useTracker();
      const locationStackAsPath = tracker.locationStack.map((locationContext) => locationContext.id).join('/');
      spy(`${id}: ${locationStackAsPath}`);
      return <div data-testid={id}>{locationStackAsPath}</div>;
    };

    render(
      <TrackerContextProvider tracker={root}>
        <div data-id={'tracker'}>
          <TrackingComponent id={'in-root'} />
          <TrackerSection id="section1">
            <TrackingComponent id="in-section1" />
            <TrackerSection id="section2">
              <TrackingComponent id={'in-section2'} />
            </TrackerSection>
          </TrackerSection>
        </div>
      </TrackerContextProvider>
    );

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, 'in-root: root');
    expect(spy).toHaveBeenNthCalledWith(2, 'in-section1: root/section1');
    expect(spy).toHaveBeenNthCalledWith(3, 'in-section2: root/section1/section2');
  });

  it('should use the given tracker and ignore TrackerContextProviders', () => {
    const root = new ReactTracker({ endpoint: '/collector', locationStack: [makeSectionContext({ id: 'root' })] });
    const customTracker = new ReactTracker({
      endpoint: '/collector',
      locationStack: [makeSectionContext({ id: 'custom' })],
    });

    const spy = jest.fn();

    const TrackingComponent = ({ id }: { id: string }) => {
      const tracker = useTracker();
      const locationStackAsPath = tracker.locationStack.map((locationContext) => locationContext.id).join('/');
      spy(`${id}: ${locationStackAsPath}`);
      return <div data-testid={id}>{locationStackAsPath}</div>;
    };

    render(
      <TrackerContextProvider tracker={root}>
        <div data-id={'tracker'}>
          <TrackingComponent id={'in-root'} />
          <TrackerSection id="section1">
            <TrackingComponent id="in-section1" />
            <TrackerSection id="section2" tracker={customTracker}>
              <TrackingComponent id={'in-section2'} />
            </TrackerSection>
          </TrackerSection>
        </div>
      </TrackerContextProvider>
    );

    expect(spy).toHaveBeenCalledTimes(3);
    expect(spy).toHaveBeenNthCalledWith(1, 'in-root: root');
    expect(spy).toHaveBeenNthCalledWith(2, 'in-section1: root/section1');
    expect(spy).toHaveBeenNthCalledWith(3, 'in-section2: custom/section2');
  });
});

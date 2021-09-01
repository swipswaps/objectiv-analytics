import { TrackerEvent, TransportSendError } from '@objectiv/tracker-core';
import MockDate from 'mockdate';
import xhrMock from 'xhr-mock';
import { XMLHttpRequestTransport } from '../src/';

const mockedMs = 1434319925275;

beforeEach(() => {
  xhrMock.setup();
  MockDate.reset();
  MockDate.set(mockedMs);
});

afterEach(() => {
  xhrMock.teardown();
  MockDate.reset();
});

describe('XMLHttpRequestTransport', () => {
  const MOCK_ENDPOINT = '/test-endpoint';

  const testEvent = new TrackerEvent({
    event: 'test-event',
  });

  it('should send using `xhr` with the default xhr function', async () => {
    const testTransport = new XMLHttpRequestTransport({
      endpoint: MOCK_ENDPOINT,
    });

    expect(testTransport.isUsable()).toBe(true);

    xhrMock.post(MOCK_ENDPOINT, (req, res) => {
      expect(req.header('Content-Type')).toEqual('text/plain');
      const { id, ...otherProps } = testEvent;
      expect(req.body()).toEqual(
        JSON.stringify({
          events: [
            {
              ...otherProps,
              id,
            }
          ],
          transport_time: mockedMs
        })
      );
      return res.status(200);
    });

    await testTransport.handle(testEvent);
  });

  it('should send using `xhr` with the default xhr function - 500 error example', async () => {
    const testTransport = new XMLHttpRequestTransport({
      endpoint: MOCK_ENDPOINT,
    });

    xhrMock.post(MOCK_ENDPOINT, {
      status: 500,
      reason: 'oops',
    });

    try {
      await testTransport.handle(testEvent);
    } catch (error) {
      expect(error).toStrictEqual(new TransportSendError());
    }

    await expect(testTransport.handle(testEvent)).rejects.toStrictEqual(new TransportSendError());
  });

  it('should send using `xhr` with the default xhr function - onError example', async () => {
    const testTransport = new XMLHttpRequestTransport({
      endpoint: MOCK_ENDPOINT,
    });

    xhrMock.post(MOCK_ENDPOINT, () => Promise.reject());

    try {
      await testTransport.handle(testEvent);
    } catch (error) {
      expect(error).toStrictEqual(new TransportSendError());
    }

    await expect(testTransport.handle(testEvent)).rejects.toStrictEqual(new TransportSendError());
  });

  it('should send using `xhr` with the provided customized xhr function', async () => {
    const customXMLHttpRequestFunction = ({
      endpoint,
      events,
    }: {
      endpoint: string;
      events: TrackerEvent[];
    }): Promise<unknown> => {
      return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest();
        const async = true;
        xhr.open('POST', endpoint, async);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Custom-Header-X', 'custom-header-value');
        xhr.withCredentials = false;
        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            resolve(xhr.response);
          } else {
            reject({
              status: xhr.status,
              statusText: xhr.statusText,
            });
          }
        };
        xhr.onerror = function () {
          reject({
            status: xhr.status,
            statusText: xhr.statusText,
          });
        };
        xhr.send(JSON.stringify(events));
      });
    };

    const testTransport = new XMLHttpRequestTransport({
      endpoint: MOCK_ENDPOINT,
      xmlHttpRequestFunction: customXMLHttpRequestFunction,
    });

    xhrMock.post(MOCK_ENDPOINT, (req, res) => {
      expect(req.header('Content-Type')).toEqual('application/json');
      expect(req.header('Custom-Header-X')).toEqual('custom-header-value');
      expect(req.body()).toEqual(JSON.stringify([testEvent]));
      return res.status(200);
    });

    await testTransport.handle(testEvent);
  });

  it('should be safe to call with an empty array of Events for devs without TS', async () => {
    // Create our XMLHttpRequest Transport Instance
    const testTransport = new XMLHttpRequestTransport({
      endpoint: MOCK_ENDPOINT,
    });
    spyOn(testTransport, 'xmlHttpRequestFunction').and.callThrough();

    // @ts-ignore purposely disable TS and call the handle method anyway
    await testTransport.handle();

    // XMLHttpRequest should not have been executed
    expect(testTransport.xmlHttpRequestFunction).not.toHaveBeenCalled();
  });
});

/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { TrackerConsole, TrackerEvent, makeTransportSendError } from '@objectiv/tracker-core';
import { defaultFetchOptions } from './defaultFetchOptions';

/**
 * The default fetch function implementation.
 */
export const defaultFetchFunction = async ({
  endpoint,
  events,
  options = defaultFetchOptions,
}: {
  endpoint: string;
  events: [TrackerEvent, ...TrackerEvent[]];
  options?: typeof defaultFetchOptions;
}): Promise<Response> => {
  return new Promise(function (resolve, reject) {
    TrackerConsole.groupCollapsed(`｢objectiv:FetchTransport｣ Sending`);
    TrackerConsole.log(`Events:`);
    TrackerConsole.log(events);
    TrackerConsole.groupEnd();

    fetch(endpoint, {
      ...options,
      body: JSON.stringify({
        events,
        // add current timestamp to the request, so the collector
        // may check if there's any clock offset between server and client
        transport_time: Date.now(),
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          TrackerConsole.groupCollapsed(`｢objectiv:FetchTransport｣ Succeeded`);
          TrackerConsole.log(`Events:`);
          TrackerConsole.log(events);
          TrackerConsole.groupEnd();

          resolve(response);
        } else {
          TrackerConsole.groupCollapsed(`｢objectiv:FetchTransport｣ Failed`);
          TrackerConsole.log(`Events:`);
          TrackerConsole.log(events);
          TrackerConsole.log(`Response: ${response}`);
          TrackerConsole.groupEnd();

          reject(makeTransportSendError());
        }
      })
      .catch(() => {
        TrackerConsole.groupCollapsed(`｢objectiv:FetchTransport｣ Error`);
        TrackerConsole.log(`Events:`);
        TrackerConsole.log(events);
        TrackerConsole.groupEnd();

        reject(makeTransportSendError());
      });
  });
};

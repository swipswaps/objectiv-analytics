/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { makeTransportSendError, TrackerConsole, TrackerEvent } from '@objectiv/tracker-core';

/**
 * The default XMLHttpRequest function implementation.
 */
export const defaultXHRFunction = ({
  endpoint,
  events,
}: {
  endpoint: string;
  events: [TrackerEvent, ...TrackerEvent[]];
}): Promise<unknown> => {
  return new Promise(function (resolve, reject) {
    TrackerConsole.groupCollapsed(`｢objectiv:XHRTransport｣ Sending`);
    TrackerConsole.log(`Events:`);
    TrackerConsole.log(events);
    TrackerConsole.groupEnd();

    const xhr = new XMLHttpRequest();
    const async = true;
    xhr.open('POST', endpoint, async);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.withCredentials = true;
    xhr.onload = () => {
      if (xhr.status === 200) {
        TrackerConsole.groupCollapsed(`｢objectiv:XHRTransport｣ Succeeded`);
        TrackerConsole.log(`Events:`);
        TrackerConsole.log(events);
        TrackerConsole.groupEnd();

        resolve(xhr.response);
      } else {
        TrackerConsole.groupCollapsed(`｢objectiv:XHRTransport｣ Failed`);
        TrackerConsole.log(`Events:`);
        TrackerConsole.log(events);
        TrackerConsole.log(`Response: ${xhr}`);
        TrackerConsole.groupEnd();

        reject(makeTransportSendError());
      }
    };
    xhr.onerror = () => {
      TrackerConsole.groupCollapsed(`｢objectiv:XHRTransport｣ Error`);
      TrackerConsole.log(`Events:`);
      TrackerConsole.log(events);
      TrackerConsole.groupEnd();

      reject(makeTransportSendError());
    };
    xhr.send(
      JSON.stringify({
        events,
        // add current timestamp to the request, so the collector
        // may check if there's any clock offset between server and client
        transport_time: Date.now(),
      })
    );
  });
};

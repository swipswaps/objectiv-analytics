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
  console,
}: {
  endpoint: string;
  events: [TrackerEvent, ...TrackerEvent[]];
  console?: TrackerConsole;
}): Promise<unknown> => {
  return new Promise(function (resolve, reject) {
    if (console) {
      console.groupCollapsed(`｢objectiv:XHRTransport｣ Sending`);
      console.log(`Events:`);
      console.log(events);
      console.groupEnd();
    }

    const xhr = new XMLHttpRequest();
    const async = true;
    xhr.open('POST', endpoint, async);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.withCredentials = true;
    xhr.onload = () => {
      if (xhr.status === 200) {
        if (console) {
          console.groupCollapsed(`｢objectiv:XHRTransport｣ Succeeded`);
          console.log(`Events:`);
          console.log(events);
          console.groupEnd();
        }

        resolve(xhr.response);
      } else {
        if (console) {
          console.groupCollapsed(`｢objectiv:XHRTransport｣ Failed`);
          console.log(`Events:`);
          console.log(events);
          console.log(`Response: ${xhr}`);
          console.groupEnd();
        }

        reject(makeTransportSendError());
      }
    };
    xhr.onerror = () => {
      if (console) {
        console.groupCollapsed(`｢objectiv:XHRTransport｣ Error`);
        console.log(`Events:`);
        console.log(events);
        console.groupEnd();
      }

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

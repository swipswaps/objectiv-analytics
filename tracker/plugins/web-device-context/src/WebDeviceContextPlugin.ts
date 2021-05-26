import { TrackerEvent, TrackerPlugin } from '@objectiv/core';
import {newWebDeviceContext, WEB_DEVICE_CONTEXT_TYPE, WebDeviceContext} from "./WebDeviceContext";

/**
 * The WebDeviceContext Plugin gathers the current user-agent using the Navigator API.
 * It detects it during construction and adds it as GlobalContext before events are handed over to Transport.
 */
export class WebDeviceContextPlugin implements TrackerPlugin {
  readonly pluginName = `${WEB_DEVICE_CONTEXT_TYPE}Plugin`;
  readonly webDeviceContext: WebDeviceContext;

  /**
   * Detects user-agent and generates a WebDeviceContext.
   */
  constructor() {
    this.webDeviceContext = newWebDeviceContext();
  }

  /**
   * Add the the WebDeviceContext to the Event's Global Contexts
   */
  beforeTransport(event: TrackerEvent): void {
    event.globalContexts.push(this.webDeviceContext);
  }
}

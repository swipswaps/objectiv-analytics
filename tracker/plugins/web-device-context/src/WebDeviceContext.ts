import { GlobalContext, TrackerEvent, TrackerPlugin } from '@objectiv/core';

const WEB_DEVICE_CONTEXT_TYPE = 'WebDeviceContext';

/**
 * WebDeviceContext is a GlobalContext tracking the `navigator` user-agent automatically.
 */
export type WebDeviceContext = GlobalContext & {
  _context_type: typeof WEB_DEVICE_CONTEXT_TYPE;
  // FIXME this naming seems inconsistent with all other properties, let's rename it to `user_agent`
  'user-agent': string;
};

/**
 * WebDeviceContext factory
 */
export function newWebDeviceContext(): WebDeviceContext {
  return {
    _context_type: WEB_DEVICE_CONTEXT_TYPE,
    id: 'device',
    'user-agent': navigator.userAgent,
  };
}

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

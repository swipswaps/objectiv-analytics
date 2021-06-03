import { GlobalContext } from '@objectiv/schema';

export const WEB_DEVICE_CONTEXT_TYPE = 'WebDeviceContext';

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

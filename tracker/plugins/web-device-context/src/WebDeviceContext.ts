import { AbstractGlobalContext } from '@objectiv/schema';

export const WEB_DEVICE_CONTEXT_TYPE = 'WebDeviceContext';

/**
 * WebDeviceContext is a GlobalContext tracking the `navigator` user-agent automatically.
 */
export interface WebDeviceContext extends AbstractGlobalContext {
  readonly _context_type: typeof WEB_DEVICE_CONTEXT_TYPE;
  readonly id: 'device';
  userAgent: string;
}

/**
 * WebDeviceContext factory
 */
export function newWebDeviceContext(): WebDeviceContext {
  return {
    _global: true,
    _context_type: WEB_DEVICE_CONTEXT_TYPE,
    id: 'device',
    userAgent: navigator.userAgent,
  };
}

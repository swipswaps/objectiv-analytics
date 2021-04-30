export const DEVICE_CONTEXT_TYPE = 'DeviceContext';

export type DeviceContext = {
  _context_type: typeof DEVICE_CONTEXT_TYPE;
  id: string;
  'user-agent': string;
};

export function createDeviceContext({ userAgent, ...rest }: { userAgent: string }): DeviceContext {
  return {
    _context_type: DEVICE_CONTEXT_TYPE,
    id: 'device',
    'user-agent': userAgent,
    ...rest,
  };
}

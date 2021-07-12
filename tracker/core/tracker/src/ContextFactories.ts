import {
  ActionContext,
  ButtonContext,
  CookieIdContext,
  DeviceContext,
  ErrorContext,
  ExpandableSectionContext,
  HttpContext,
  InputContext,
  ItemContext,
  LinkContext,
  MediaPlayerContext,
  NavigationContext,
  OverlayContext,
  ScreenContext,
  SectionContext,
  SessionContext,
  WebDocumentContext,
} from '@objectiv/schema';

export const makeActionContext = (props: { id: string; text: string }): ActionContext => ({
  __location_context: true,
  __item_context: true,
  __action_context: true,
  _context_type: 'ActionContext',
  id: props.id,
  text: props.text,
});

export const makeButtonContext = (props: { id: string; text: string }): ButtonContext => ({
  __location_context: true,
  __item_context: true,
  __action_context: true,
  _context_type: 'ButtonContext',
  id: props.id,
  text: props.text,
});

export const makeCookieIdContext = (props: { id: string; cookie_id: string }): CookieIdContext => ({
  __global_context: true,
  _context_type: 'CookieIdContext',
  id: props.id,
  cookie_id: props.cookie_id,
});

export const makeDeviceContext = (props: { id: string; user_agent: string }): DeviceContext => ({
  __global_context: true,
  _context_type: 'DeviceContext',
  id: props.id,
  user_agent: props.user_agent,
});

export const makeErrorContext = (props: { id: string; message: string }): ErrorContext => ({
  __global_context: true,
  _context_type: 'ErrorContext',
  id: props.id,
  message: props.message,
});

export const makeExpandableSectionContext = (props: { id: string }): ExpandableSectionContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'ExpandableSectionContext',
  id: props.id,
});

export const makeHttpContext = (props: {
  id: string;
  host: string;
  user_agent: string;
  remote_address: string;
}): HttpContext => ({
  __global_context: true,
  _context_type: 'HttpContext',
  id: props.id,
  host: props.host,
  user_agent: props.user_agent,
  remote_address: props.remote_address,
});

export const makeInputContext = (props: { id: string }): InputContext => ({
  __location_context: true,
  __item_context: true,
  _context_type: 'InputContext',
  id: props.id,
});

export const makeItemContext = (props: { id: string }): ItemContext => ({
  __location_context: true,
  __item_context: true,
  _context_type: 'ItemContext',
  id: props.id,
});

export const makeLinkContext = (props: { id: string; text: string; href: string }): LinkContext => ({
  __location_context: true,
  __item_context: true,
  __action_context: true,
  _context_type: 'LinkContext',
  id: props.id,
  text: props.text,
  href: props.href,
});

export const makeMediaPlayerContext = (props: { id: string }): MediaPlayerContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'MediaPlayerContext',
  id: props.id,
});

export const makeNavigationContext = (props: { id: string }): NavigationContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'NavigationContext',
  id: props.id,
});

export const makeOverlayContext = (props: { id: string }): OverlayContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'OverlayContext',
  id: props.id,
});

export const makeScreenContext = (props: { id: string; screen: string }): ScreenContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'ScreenContext',
  id: props.id,
  screen: props.screen,
});

export const makeSectionContext = (props: { id: string }): SectionContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'SectionContext',
  id: props.id,
});

export const makeSessionContext = (props: { id: string; hit_number: number }): SessionContext => ({
  __global_context: true,
  _context_type: 'SessionContext',
  id: props.id,
  hit_number: props.hit_number,
});

export const makeWebDocumentContext = (props: { id: string; url: string }): WebDocumentContext => ({
  __location_context: true,
  __section_context: true,
  _context_type: 'WebDocumentContext',
  id: props.id,
  url: props.url,
});

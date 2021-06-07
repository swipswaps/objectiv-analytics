import {
  makeActionContext,
  makeButtonContext,
  makeExpandableSectionContext,
  makeInputContext,
  makeItemContext,
  makeLinkContext,
  makeMediaPlayerContext,
  makeNavigationContext,
  makeOverlayContext,
  makeScreenContext,
  makeSectionContext,
  makeWebDocumentContext,
} from '../src';

describe('Context Factories', () => {
  it('SectionContext', () => {
    expect(makeSectionContext({ id: 'section-A' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'SectionContext',
      id: 'section-A',
    });
  });

  it('WebDocumentContext', () => {
    expect(makeWebDocumentContext({ id: '#document-a', url: '/test' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'WebDocumentContext',
      id: '#document-a',
      url: '/test',
    });
  });

  it('ScreenContext', () => {
    expect(makeScreenContext({ id: 'home-screen', screen: 'home-screen' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'ScreenContext',
      id: 'home-screen',
      screen: 'home-screen',
    });
  });

  it('ExpandableSectionContext', () => {
    expect(makeExpandableSectionContext({ id: 'accordion-a' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'ExpandableSectionContext',
      id: 'accordion-a',
    });
  });

  it('MediaPlayerContext', () => {
    expect(makeMediaPlayerContext({ id: 'player-1' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'MediaPlayerContext',
      id: 'player-1',
    });
  });

  it('NavigationContext', () => {
    expect(makeNavigationContext({ id: 'top-nav' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'NavigationContext',
      id: 'top-nav',
    });
  });

  it('OverlayContext', () => {
    expect(makeOverlayContext({ id: 'top-menu' })).toStrictEqual({
      _location_context: true,
      _section_context: true,
      _context_type: 'OverlayContext',
      id: 'top-menu',
    });
  });

  it('ItemContext', () => {
    expect(makeItemContext({ id: 'item-1' })).toStrictEqual({
      _location_context: true,
      _item_context: true,
      _context_type: 'ItemContext',
      id: 'item-1',
    });
  });

  it('InputContext', () => {
    expect(makeInputContext({ id: 'input-1' })).toStrictEqual({
      _location_context: true,
      _item_context: true,
      _context_type: 'InputContext',
      id: 'input-1',
    });
  });

  it('ActionContext', () => {
    expect(makeActionContext({ id: 'chevron-right', path: '/next', text: 'Next Slide' })).toStrictEqual({
      _location_context: true,
      _item_context: true,
      _action_context: true,
      _context_type: 'ActionContext',
      id: 'chevron-right',
      path: '/next',
      text: 'Next Slide',
    });
  });

  it('ButtonContext', () => {
    expect(makeButtonContext({ id: 'confirm-data', text: 'Confirm' })).toStrictEqual({
      _location_context: true,
      _item_context: true,
      _action_context: true,
      _context_type: 'ButtonContext',
      id: 'confirm-data',
      path: '',
      text: 'Confirm',
    });
  });

  it('LinkContext', () => {
    expect(makeLinkContext({ id: 'confirm-data', href: '/some/url', text: 'Click for Details' })).toStrictEqual({
      _location_context: true,
      _item_context: true,
      _action_context: true,
      _context_type: 'LinkContext',
      id: 'confirm-data',
      path: '/some/url',
      text: 'Click for Details',
    });
  });
});

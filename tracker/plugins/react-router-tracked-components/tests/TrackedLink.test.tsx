/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { SpyTransport } from "@objectiv/testing-tools";
import { Tracker } from "@objectiv/tracker-core";
import {
  ObjectivProvider,
  TrackedDiv,
  TrackedRootLocationContext,
  TrackingContextProvider
} from '@objectiv/tracker-react';
import { fireEvent, getByTestId, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TrackedLink, TrackedLinkProps } from '../src';

describe('TrackedLink', () => {
  const spyTransport = { transportName: 'SpyTransport', handle: jest.fn(), isUsable: () => true };
  const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });

  const cases: [TrackedLinkProps, { id: string; href: string }][] = [
    [
      { to: '/', children: 'test' },
      { id: 'test', href: '/' },
    ],
    [
      { to: '/slug', children: 'test' },
      { id: 'test', href: '/slug' },
    ],
    [
      { to: '/', children: 'test', id: 'custom-id' },
      { id: 'custom-id', href: '/' },
    ],
    [
      { to: '/', title: 'click me' },
      { id: 'click-me', href: '/' },
    ],
    [
      { to: '/', title: 'click me', id: 'custom-id' },
      { id: 'custom-id', href: '/' },
    ],
    [
      { to: { pathname: '/slug' }, children: 'test' },
      { id: 'test', href: '/slug' },
    ],
    [
      { to: { pathname: '/' }, children: 'test' },
      { id: 'test', href: '/' },
    ],
    [
      { to: { search: '?p=val' }, children: 'test' },
      { id: 'test', href: '/?p=val' },
    ],
    [
      { to: { pathname: '/', search: '?p=val' }, children: 'test' },
      { id: 'test', href: '/?p=val' },
    ],
    [
      { to: { hash: '#/hash' }, children: 'test' },
      { id: 'test', href: '/#/hash' },
    ],
    [
      { to: { pathname: '/', hash: '#/hash' }, children: 'test' },
      { id: 'test', href: '/#/hash' },
    ],
    [
      { to: { search: '?p=val', hash: '#/hash' }, children: 'test' },
      { id: 'test', href: '/?p=val#/hash' },
    ],
    [
      { to: { search: '?p=val', hash: '#/hash' }, children: 'test' },
      { id: 'test', href: '/?p=val#/hash' },
    ],
    [
      { to: { pathname: '/', search: '?p=val', hash: '#/hash' }, children: 'test' },
      { id: 'test', href: '/?p=val#/hash' },
    ]
  ];

  cases.forEach(([linkProps, expectedAttributes]) => {
    it(`props: ${JSON.stringify(linkProps)} > LinkContext: ${JSON.stringify(expectedAttributes)}`, () => {
      jest.resetAllMocks();

      const { container } = render(
        <BrowserRouter>
          <TrackingContextProvider tracker={tracker}>
            <TrackedLink {...linkProps} data-testid={'test'} />
          </TrackingContextProvider>
        </BrowserRouter>
      );

      fireEvent.click(getByTestId(container, 'test'));

      expect(spyTransport.handle).toHaveBeenCalledTimes(1);
      expect(spyTransport.handle).toHaveBeenCalledWith(
        expect.objectContaining({
          _type: 'PressEvent',
          location_stack: [
            expect.objectContaining({
              _type: 'LinkContext',
              ...expectedAttributes,
            }),
          ],
        })
      );
    });
  });

  it('should allow forwarding id and title props', () => {
    render(
      <BrowserRouter>
        <ObjectivProvider tracker={tracker}>
          <TrackedLink data-testid={'link1'} to={'/'} id={'id'} title={'title'}>
            test
          </TrackedLink>
          <TrackedLink data-testid={'link2'} to={'/'} id={'id'} title={'title'} forwardId={true} forwardTitle={true}>
            test
          </TrackedLink>
        </ObjectivProvider>
      </BrowserRouter>
    );

    expect(screen.getByTestId('link1').getAttribute('id')).toBe(null);
    expect(screen.getByTestId('link1').getAttribute('title')).toBe(null);
    expect(screen.getByTestId('link2').getAttribute('id')).toBe('id');
    expect(screen.getByTestId('link2').getAttribute('title')).toBe('title');
  });

  it('should console.error if an id cannot be automatically generated', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <ObjectivProvider tracker={tracker}>
          <TrackedRootLocationContext Component={'div'} id={'root'}>
            <TrackedDiv id={'content'}>
              <TrackedLink to={'/'}>
                🏡
              </TrackedLink>
            </TrackedDiv>
          </TrackedRootLocationContext>
        </ObjectivProvider>
      </BrowserRouter>
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(
      '｢objectiv｣ Could not generate id for LinkContext @ RootLocation:root / Content:content. Please provide either the `title` or the `id` property manually.'
    );
  });

  it('should allow forwarding refs', () => {
    const linkRef = React.createRef<HTMLAnchorElement>();

    render(
      <BrowserRouter>
        <ObjectivProvider tracker={tracker}>
          <TrackedLink to='/' ref={linkRef}>
            Press me!
          </TrackedLink>
        </ObjectivProvider>
      </BrowserRouter>
    );

    expect(linkRef.current).toMatchInlineSnapshot(`
      <a
        href="/"
      >
        Press me!
      </a>
    `);
  });

  it('should execute the given onClick as well', async () => {
    const clickSpy = jest.fn();

    const { container } = render(
      <BrowserRouter>
        <ObjectivProvider tracker={tracker}>
          <TrackedLink data-testid={'test1'} to='/' onClick={clickSpy}>
            Press me!
          </TrackedLink>
          <TrackedLink data-testid={'test2'} to='/' onClick={clickSpy} reloadDocument={true}>
            Press me!
          </TrackedLink>
        </ObjectivProvider>
      </BrowserRouter>
    );

    fireEvent.click(getByTestId(container, 'test1'));
    fireEvent.click(getByTestId(container, 'test2'));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(2));
  });

  it('should wait until tracked', async () => {
    jest.useFakeTimers();
    const clickSpy = jest.fn();
    const spyTransport = new SpyTransport();
    jest
      .spyOn(spyTransport, 'handle')
      .mockImplementation(async () => new Promise((resolve) => setTimeout(resolve, 100)));
    const tracker = new Tracker({ applicationId: 'app-id', transport: spyTransport });
    jest.spyOn(spyTransport, 'handle');

    const { container } = render(
      <BrowserRouter>
        <ObjectivProvider tracker={tracker}>
          <TrackedLink data-testid={'test'} to='/some-url' waitUntilTracked={true} onClick={clickSpy}>
            Press me
          </TrackedLink>
        </ObjectivProvider>
      </BrowserRouter>
    );

    jest.resetAllMocks();

    fireEvent.click(getByTestId(container, 'test'));

    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));

    expect(spyTransport.handle).toHaveBeenCalledTimes(1);
    expect(spyTransport.handle).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        _type: 'PressEvent',
        location_stack: expect.arrayContaining([
          expect.objectContaining({
            _type: 'LinkContext',
            id: 'press-me',
          }),
        ]),
      })
    );
  });
});

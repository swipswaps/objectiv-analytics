/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import Link, { LinkProps } from "@docusaurus/Link";
import { LinkContextWrapper } from "../locationWrappers/LinkContextWrapper";
import { makeIdFromString } from "../common/factories/makeIdFromString";
import { makeTextFromChildren } from "../common/factories/makeTextFromChildren";
import { trackPressEvent } from "../eventTrackers/trackPressEvent";
import React from 'react';
import { TrackedComponent } from "./trackedTypes";

export type TrackedLinkProps = TrackedComponent<LinkProps> & {
  id?: string,
  forwardId?: boolean,
  waitUntilTracked?: boolean
};

export const TrackedLink = React.forwardRef<HTMLAnchorElement, TrackedLinkProps>((props: TrackedLinkProps, ref) => {
  const { Component = Link, forwardId = false, waitUntilTracked = false, ...otherProps } = props;
  const text = props.title ?? makeTextFromChildren(props.children);
  const id = props.id ?? makeIdFromString(text);

  return (
    <LinkContextWrapper id={id} href={props.href ?? props.to}>
      {(trackingContext) => (
        <Component
          {...otherProps}
          ref={ref}
          id={forwardId ? id: undefined}
          onClick={async (event) => {
            props.onClick && props.onClick(event);
            await trackPressEvent({...trackingContext, ...{
                options: !waitUntilTracked ? undefined : {
                  waitForQueue: true,
                  flushQueue: true
                }
              }
            })
          }}
        />
      )}
    </LinkContextWrapper>
  );
})

/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ContentContextWrapper } from '@objectiv/tracker-react';
import React from 'react';

export type TrackedAsideProps = React.HTMLAttributes<HTMLDivElement> & {
  id?: string;
  forwardId?: boolean;
};

export const TrackedAside = React.forwardRef<HTMLDivElement, TrackedAsideProps>((props, ref) => {
  const { id = 'aside', forwardId = false, ...otherProps } = props;

  return (
    <ContentContextWrapper id={id}>
      <aside {...otherProps} ref={ref} id={forwardId ? id : undefined} />
    </ContentContextWrapper>
  );
});

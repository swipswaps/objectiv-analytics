/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { NavigationContextWrapper } from "@objectiv/tracker-react";
import React from "react";

export type TrackedSectionProps = React.HTMLAttributes<HTMLDivElement> & {
  id?: string,
  forwardId?: boolean
};

export const TrackedSection = React.forwardRef<HTMLDivElement, TrackedSectionProps>((props: TrackedSectionProps, ref) => {
  const { id = 'section', forwardId = false, ...otherProps } = props;

  return (
    <NavigationContextWrapper id={id}>
      <section {...otherProps} ref={ref} id={forwardId ? id: undefined} />
    </NavigationContextWrapper>
  );
});

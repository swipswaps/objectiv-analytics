/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { NavigationContextWrapper } from "@objectiv/tracker-react";
import React from "react";

export type TrackedFooterProps = React.HTMLAttributes<HTMLDivElement> & {
  id?: string,
  forwardId?: boolean
};

export const TrackedFooter = React.forwardRef<HTMLDivElement, TrackedFooterProps>((props, ref) => {
  const { id = 'footer', forwardId = false, ...otherProps } = props;

  return (
    <NavigationContextWrapper id={id}>
      <footer {...otherProps} ref={ref} id={forwardId ? id: undefined} />
    </NavigationContextWrapper>
  );
});

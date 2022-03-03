/*
 * Copyright 2022 Objectiv B.V.
 */

import { OverlayContextWrapper, useHiddenEventTracker, useVisibleEventTracker } from '@objectiv/tracker-react';
import React, { useEffect } from 'react';
import { Modal, ModalProps } from 'react-native';

/**
 * TrackedModal has the same props of React Native Modal with the addition of a required `id` prop.
 */
export type TrackedModalProps = ModalProps & {
  /**
   * The OverlayContext `id`.
   */
  id: string;
};

/**
 * TrackedModal is an automatically tracked Modal. Wraps Modal in OverlayContext and tracks visibility Events.
 */
export function TrackedModal(props: TrackedModalProps) {
  const { id, ...modalProps } = props;
  const [previousVisibleState, setPreviousVisibleState] = React.useState(props.visible);

  const WrappedModal = (props: ModalProps) => {
    const trackVisibleEvent = useVisibleEventTracker();
    const trackHiddenEvent = useHiddenEventTracker();

    useEffect(() => {
      if(props.visible === undefined || previousVisibleState === undefined) {
        return;
      }

      if(props.visible === previousVisibleState) {
        return;
      }

      if(props.visible) {
        trackVisibleEvent()
      } else {
        trackHiddenEvent();
      }

      setPreviousVisibleState(props.visible);
    }, [props.visible])

    return <Modal {...props} />
  }

  return (
    <OverlayContextWrapper id={id}>
      <WrappedModal {...modalProps} />
    </OverlayContextWrapper>
  );
}

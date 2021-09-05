import { TrackedElement, TrackingAttribute } from '../../src';

const makeTrackedElement = (id: string, context: string, tagName: keyof HTMLElementTagNameMap): TrackedElement => {
  const trackedDiv = document.createElement(tagName);
  trackedDiv.setAttribute(TrackingAttribute.elementId, id);
  trackedDiv.setAttribute(TrackingAttribute.context, context);

  return trackedDiv as TrackedElement;
};

export default makeTrackedElement;

import { ElementTrackingAttribute, TrackedElement } from "../../src";

const makeTrackedElement = (id: string, context: string, tagName: keyof HTMLElementTagNameMap): TrackedElement => {
  const trackedDiv = document.createElement(tagName);
  trackedDiv.setAttribute(ElementTrackingAttribute.elementId, id);
  trackedDiv.setAttribute(ElementTrackingAttribute.context, context);

  return trackedDiv as TrackedElement;
}

export default makeTrackedElement;

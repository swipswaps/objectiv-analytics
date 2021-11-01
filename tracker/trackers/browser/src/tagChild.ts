import { ChildrenTaggingQuery } from './definitions/structChildrenTaggingQuery';
import { TrackerErrorHandlerCallback } from "./definitions/TrackerErrorHandlerCallback";
import { tagChildren } from "./tagChildren";

/**
 * Syntactic sugar to track only one child.
 *
 * Examples
 *
 *    tagChild({
 *      query: '#button1',
 *      tagAs: tagButton({ id: 'button1', text: 'Button 1' })
 *    })
 *
 *    tagChild({
 *      query: '#button2',
 *      tagAs: tagButton({ id: 'button2', text: 'Button 2' })
 *    })
 *
 */
export const tagChild = (parameters: ChildrenTaggingQuery, onError?: TrackerErrorHandlerCallback) => {
  return tagChildren([parameters], onError);
};

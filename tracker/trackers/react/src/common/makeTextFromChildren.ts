/*
 * Copyright 2021 Objectiv B.V.
 */

import { isValidElement, ReactNode } from 'react';

/**
 * Retrieve text from given ReactNode children.
 * The resulting text may be may be used, among others, to infer a valid text and identifier for a Button.
 *
 * @see makeIdFromString
 */
export const makeTextFromChildren = (children: ReactNode): string => {
  const text = recursiveParseTextFromChildrenNode(children);

  // Throw if we did not manage to get any text
  if (!text) {
    throw new Error('Could not infer any text from children nodes. Please provide one manually.');
  }

  return text.trim();
};

/**
 * Recursively traverses the given ReactNode's children in an attempt to retrieve their texts.
 *
 * String Nodes are returned as is, Number nodes are converted to strings and Array children are recursively processed.
 */
const recursiveParseTextFromChildrenNode = (children: ReactNode): string | undefined => {
  let text;

  // Return strings as they are
  if (typeof children === 'string') {
    text = children;
  }

  // Parse numbers to decimal strings
  else if (typeof children === 'number') {
    text = children.toString(10);
  }

  // If it's an array, parse each child and then compose a string with all of their texts
  else if (children instanceof Array) {
    text = children.map(recursiveParseTextFromChildrenNode).join(' ');
  }

  // If it's a valid React element, parse its children prop
  else if (isValidElement(children)) {
    text = recursiveParseTextFromChildrenNode(children.props.children);
  }

  return text;
};

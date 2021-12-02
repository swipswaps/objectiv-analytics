/*
 * Copyright 2021 Objectiv B.V.
 */

import { isValidElement, ReactNode } from 'react';

/**
 * Recursively traverses the given ReactNode's children in an attempt to retrieve their texts.
 * The resulting text may be may be used, among others, to infer a valid text and identifier for a Button.
 *
 * String Nodes are returned as is, Number nodes are converted to strings and Array children are recursively processed.
 *
 * @see makeIdFromString
 */
export const makeTextFromChildren = (children: ReactNode): string => {
  // Return strings as they are
  if (typeof children === 'string') {
    return children;
  }

  // Parse numbers to decimal strings
  if (typeof children === 'number') {
    return children.toString(10);
  }

  // If it's an array, parse each child and then compose a string with all of their texts
  if (children instanceof Array) {
    return children.map(makeTextFromChildren).join(' ');
  }

  // If it's a valid React element, parse its children
  if (isValidElement(children)) {
    return makeTextFromChildren(children.props.children);
  }

  // Else throw
  throw new Error('Could not infer any text from children node. Please provide one via props.text');
};

/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { getLocationPath } from '@objectiv/tracker-core';
import { LocationNode, LocationStackEntry, RootLocationNode } from '../types';

const locationTree: RootLocationNode = { id: null, locationContext: null, children: [] };
const errorCache = new Map<string, 'collision'>();

export const LocationTree = {
  log: (locationNode: LocationNode | RootLocationNode = locationTree, depth = 0) => {
    if (!locationNode) {
      return;
    }

    if (locationNode.locationContext) {
      console.log('  '.repeat(depth) + locationNode.locationContext._type + ':' + locationNode.locationContext.id);
    }

    depth++;

    locationNode.children.forEach((locationChildNode) => LocationTree.log(locationChildNode, depth));
  },

  find: (
    id: string | null,
    locationNode: LocationNode | RootLocationNode = locationTree
  ): null | LocationNode | RootLocationNode => {
    if (locationNode.id === id) {
      return locationNode;
    }

    let result: null | LocationNode | RootLocationNode = null;
    for (let i = 0; result === null && i < locationNode.children.length; i++) {
      result = LocationTree.find(id, locationNode.children[i]);
    }

    return result;
  },

  validate: (
    locationNode: LocationNode | RootLocationNode = locationTree,
    locationStack: AbstractLocationContext[] = [],
    locationPaths: Set<string> = new Set()
  ) => {
    const { children, locationContext } = locationNode;

    if (locationContext) {
      locationStack.push(locationContext);
    }

    if (!children.length) {
      const locationPath = getLocationPath(locationStack);
      const locationPathsSize = locationPaths.size;
      locationPaths.add(getLocationPath(locationStack));

      if (locationPathsSize === locationPaths.size && errorCache.get(locationPath) !== 'collision') {
        console.error(`｢objectiv｣ Location collision detected: ${locationPath}`);
        console.log(`Location Tree:`);
        LocationTree.log();
        errorCache.set(locationPath, 'collision');
      }
    }

    children.map((childLocationNode) => LocationTree.validate(childLocationNode, [...locationStack], locationPaths));
  },

  add: (locationStackEntry: LocationStackEntry, parentLocationId: string | null) => {
    const parentLocationNode = LocationTree.find(parentLocationId);
    if (!parentLocationNode) {
      throw new Error('Parent not found');
    }

    parentLocationNode.children.push({ ...locationStackEntry, children: [] });

    LocationTree.validate();
  },
};

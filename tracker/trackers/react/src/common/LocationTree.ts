/*
 * Copyright 2021 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { getLocationPath } from '@objectiv/tracker-core';
import { LocationNode, LocationEntry, RootLocationNode } from '../types';

/**
 * Internal state to hold the complete known LocationTree.
 * Each node, exception made for the root one, carries a unique identifier and a Location Context.
 * All nodes may have children LocationNodes.
 */
const locationTree: RootLocationNode = { id: null, locationContext: null, children: [] };

/**
 * Internal state to keep track of which identifiers are already known for a certain issue. This is used to prevent
 * notifying the developer of the same issues multiple times.
 *
 * NOTE: Currently we support only `collision` issues. As more checks are implemented this Map may change.
 */
const errorCache = new Map<string, 'collision'>();

/**
 * LocationTree is a global object providing a few utility methods to interact with the `locationTree` global state.
 * LocationContextWrapper makes sure to add new LocationNodes to the tree whenever a Location Wrapper is used.
 */
export const LocationTree = {
  /**
   * completely resets LocationTree state. Mainly useful while testing.
   */
  clear: () => {
    locationTree.children = [];
    errorCache.clear();
  },

  /**
   * Logs a readable version of the `locationTree` state to the console
   */
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

  /**
   * Finds a node by its id recursively. Returns `null` if a node cannot be found with the given identifier.
   * A starting node, other than the whole `locationTree` state, can be specified.
   */
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

  /**
   * Checks the validity of the `locationTree` state.
   * Currently we perform only Uniqueness Check: if identical branches are detected they will be logged to the console.
   *
   * Note: This method is invoked automatically when calling `LocationTree.add`.
   */
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

  /**
   * Wraps the given LocationEntry in a LocationNode and adds it to the `locationTree` state, then invokes
   * `LocationTree.validate` to report any issues.
   *
   * Note: This method is invoked automatically by LocationContextWrapper.
   */
  add: (locationEntry: LocationEntry, parentLocationEntry?: LocationEntry) => {
    const parentLocationNode = LocationTree.find(parentLocationEntry?.id ?? null);
    if (!parentLocationNode) {
      throw new Error('Parent LocationEntry Node not found.');
    }

    parentLocationNode.children.push({ ...locationEntry, children: [] });

    LocationTree.validate();
  },
};

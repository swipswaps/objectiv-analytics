/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { AbstractLocationContext } from '@objectiv/schema';
import { getLocationPath } from '@objectiv/tracker-core';
import { LocationContext } from '../types';

/**
 * LocationTree nodes have the same shape of LocationContext, but they can have children LocationNodes themselves.
 */
export type LocationNode = LocationContext<AbstractLocationContext> & {
  /**
   * The parent LocationNode identifier.
   */
  parentLocationId: string | null;
};

/**
 * Internal state to hold a complete list of all known LocationNodes.
 * Each node, exception made for the root one, is a uniquely identifiable Location Context.
 * All nodes, except the root ine, have a parent LocationNode.
 */
export let locationNodes: LocationNode[] = [];

/**
 * Internal state to keep track of which identifiers are already known for a certain issue. This is used to prevent
 * notifying the developer of the same issues multiple times.
 *
 * NOTE: Currently we support only `collision` issues. As more checks are implemented this Map may change.
 */
export const errorCache = new Map<string, 'collision'>();

/**
 * LocationTree is a global object providing a few utility methods to interact with the `locationNodes` global state.
 * LocationContextWrapper makes sure to add new LocationNodes to the tree whenever a Location Wrapper is used.
 */
export const LocationTree = {
  /**
   * completely resets LocationTree state. Mainly useful while testing.
   */
  clear: () => {
    locationNodes = [];
    errorCache.clear();
  },

  /**
   * Logs a readable version of the `locationNodes` state to the console
   */
  log: (locationNode?: LocationNode, depth = 0) => {
    if (!locationNode) {
      LocationTree.roots().map((locationRootNode) => LocationTree.log(locationRootNode));
      return;
    }

    console.log('  '.repeat(depth) + locationNode._type + ':' + locationNode.id);
    depth++;
    LocationTree.children(locationNode).forEach((childLocationNode) => LocationTree.log(childLocationNode, depth));
  },

  /**
   * FIXME
   * Checks the validity of the `locationNodes` state.
   * Currently, we perform only Uniqueness Check: if identical branches are detected they will be logged to the console.
   *
   * Note: This method is invoked automatically when calling `LocationTree.add`.
   */
  validate: (
    locationNode?: LocationNode,
    locationStack: AbstractLocationContext[] = [],
    locationPaths: Set<string> = new Set()
  ) => {
    if (!locationNode) {
      LocationTree.roots().map((childLocationNode) => {
        LocationTree.validate(childLocationNode, [...locationStack], locationPaths);
      });
      return;
    }

    locationStack.push(locationNode);

    // Collision detection
    const locationPath = getLocationPath(locationStack);
    const locationPathsSize = locationPaths.size;
    locationPaths.add(locationPath);

    if (locationPathsSize === locationPaths.size && errorCache.get(locationPath) !== 'collision') {
      console.error(`｢objectiv｣ Location collision detected: ${locationPath}`);
      console.log(`Location Tree:`);
      LocationTree.log();
      errorCache.set(locationPath, 'collision');
    }

    // Rerun validation for each child
    LocationTree.children(locationNode).map((childLocationNode) => {
      LocationTree.validate(childLocationNode, [...locationStack], locationPaths);
    });
  },

  /**
   * Adds the given LocationContext to the `locationNodes` state, then invokes `LocationTree.validate` to report issues.
   *
   * Note: This method is invoked automatically by LocationContextWrapper on mount.
   */
  add: (
    locationContext: LocationContext<AbstractLocationContext>,
    parentLocationContext: LocationContext<AbstractLocationContext> | null
  ) => {
    locationNodes.push({ ...locationContext, parentLocationId: parentLocationContext?.__location_id ?? null });
    LocationTree.validate();
  },

  children: ({ __location_id }: LocationNode) => {
    return locationNodes.filter(({ parentLocationId }) => parentLocationId === __location_id);
  },

  roots: () => {
    return locationNodes.filter(({ parentLocationId }) => parentLocationId === null);
  },

  /**
   * Adds the given LocationContext to the `locationNodes` state, then invokes `LocationTree.validate` to report issues.
   *
   * Note: This method is invoked automatically by LocationContextWrapper on umount.
   */
  remove: (locationContext: LocationContext<AbstractLocationContext>) => {
    locationNodes = locationNodes.filter(({ __location_id }) => __location_id !== locationContext.__location_id);
    const sizeBeforeCleanup = locationNodes.length;

    // Filter out all nodes that have a parentLocationId that does not exist anymore
    locationNodes = locationNodes.reduce((accumulator, locationNode) => {
      if (!locationNode.parentLocationId) {
        accumulator.push(locationNode);
      }
      if (locationNodes.some(({ __location_id }) => __location_id === locationNode.parentLocationId)) {
        accumulator.push(locationNode);
      }
      return accumulator;
    }, [] as LocationNode[]);

    // Keep running until the cleaned up tree stop changing in size
    if (sizeBeforeCleanup !== locationNodes.length) {
      LocationTree.remove(locationContext);
    }
  },
};

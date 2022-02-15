/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ContextsConfig } from './Context';
import { isValidIndex } from './helpers';
import { Tracker } from './Tracker';
import { TrackerPluginInterface } from './TrackerPluginInterface';
import { TrackerPluginLifecycleInterface } from './TrackerPluginLifecycleInterface';

/**
 * The configuration object of TrackerPlugins. It accepts a list of plugins and, optionally, a Tracker Console.
 */
export type TrackerPluginsConfiguration = {
  /**
   * The Tracker instance this TrackerPlugins is bound to.
   */
  tracker: Tracker;

  /**
   * An array of Plugins.
   */
  plugins: TrackerPluginInterface[];
};

/**
 * TrackerPlugins is responsible for constructing TrackerPlugin instances and orchestrating their callbacks.
 * It also makes sure to check if Plugins are usable, before executing their callbacks.
 *
 * @note plugin order matters, as they are executed sequentially, a plugin executed later has access to previous
 * Plugins mutations. For example a plugin meant to access the finalized version of the TrackerEvent should be placed
 * at the bottom of the list.
 */
export class TrackerPlugins implements TrackerPluginLifecycleInterface {
  readonly tracker: Tracker;
  plugins: TrackerPluginInterface[] = [];

  /**
   * Plugins can be lazy. Map through them to instantiate them.
   */
  constructor(trackerPluginsConfig: TrackerPluginsConfiguration) {
    this.tracker = trackerPluginsConfig.tracker;

    trackerPluginsConfig.plugins.map((plugin) => {
      if (this.has(plugin.pluginName)) {
        throw new Error(`｢objectiv:TrackerPlugins｣ ${plugin.pluginName}: duplicated`);
      }

      this.plugins.push(plugin);
    });

    if (this.tracker.console) {
      this.tracker.console.groupCollapsed(`｢objectiv:TrackerPlugins｣ Initialized`);
      this.tracker.console.group(`Plugins:`);
      this.tracker.console.log(this.plugins.map((plugin) => plugin.pluginName).join(', '));
      this.tracker.console.groupEnd();
      this.tracker.console.groupEnd();
    }
  }

  /**
   * Checks whether a Plugin instance exists by its name.
   */
  has(pluginName: string): boolean {
    return this.plugins.find((plugin) => plugin.pluginName === pluginName) !== undefined;
  }

  /**
   * Gets a Plugin instance by its name. Returns null if the plugin is not found.
   */
  get(pluginName: string): TrackerPluginInterface {
    const plugin = this.plugins.find((plugin) => plugin.pluginName === pluginName);

    if (!plugin) {
      throw new Error(`｢objectiv:TrackerPlugins｣ ${pluginName}: not found`);
    }

    return plugin;
  }

  /**
   * Adds a new Plugin at the end of the plugins list, or at the specified index, and initializes it.
   */
  add(plugin: TrackerPluginInterface, index?: number) {
    if (index !== undefined && !isValidIndex(index)) {
      throw new Error(`｢objectiv:TrackerPlugins｣ invalid index`);
    }

    if (this.has(plugin.pluginName)) {
      throw new Error(`｢objectiv:TrackerPlugins｣ ${plugin.pluginName}: already exists. Use "replace" instead`);
    }

    const spliceIndex = index ?? this.plugins.length;
    this.plugins.splice(spliceIndex, 0, plugin);

    if (this.tracker.console) {
      this.tracker.console.log(
        `%c｢objectiv:TrackerPlugins｣ ${plugin.pluginName} added at index ${spliceIndex}`,
        'font-weight: bold'
      );
    }

    const pluginInstance = this.get(plugin.pluginName);
    pluginInstance.initialize && pluginInstance.initialize(this.tracker);
  }

  /**
   * Removes a Plugin by its name.
   */
  remove(pluginName: string) {
    const pluginInstance = this.get(pluginName);

    this.plugins = this.plugins.filter(({ pluginName }) => pluginName !== pluginInstance.pluginName);

    if (this.tracker.console) {
      this.tracker.console.log(`%c｢objectiv:TrackerPlugins｣ ${pluginInstance.pluginName} removed`, 'font-weight: bold');
    }
  }

  /**
   * Replaces a plugin with a new one of the same type at the same index, unless a new index has been specified.
   */
  replace(plugin: TrackerPluginInterface, index?: number) {
    if (index !== undefined && !isValidIndex(index)) {
      throw new Error(`｢objectiv:TrackerPlugins｣ invalid index`);
    }

    const originalIndex = this.plugins.findIndex(({ pluginName }) => pluginName === plugin.pluginName);

    this.remove(plugin.pluginName);

    this.add(plugin, index ?? originalIndex);
  }

  /**
   * Calls each Plugin's `initialize` callback function, if defined
   */
  initialize(contexts: Required<ContextsConfig>): void {
    this.plugins.forEach((plugin) => plugin.isUsable() && plugin.initialize && plugin.initialize(contexts));
  }

  /**
   * Calls each Plugin's `beforeTransport` callback function, if defined
   */
  beforeTransport(contexts: Required<ContextsConfig>): void {
    this.plugins.forEach((plugin) => plugin.isUsable() && plugin.beforeTransport && plugin.beforeTransport(contexts));
  }
}

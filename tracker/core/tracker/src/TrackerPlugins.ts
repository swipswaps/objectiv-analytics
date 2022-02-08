/*
 * Copyright 2021-2022 Objectiv B.V.
 */

import { ContextsConfig } from './Context';
import { isValidIndex } from './helpers';
import { TrackerConsole } from './TrackerConsole';
import { TrackerPluginConfig, TrackerPluginInterface } from './TrackerPluginInterface';
import { TrackerPluginLifecycleInterface } from './TrackerPluginLifecycleInterface';

/**
 * TrackerPlugins can be specified by instance, name or even on the fly as Objects.
 *
 * @example
 *
 *  Given a hypothetical PluginA:
 *
 *    class PluginA implements TrackerPlugin {
 *      readonly pluginName = 'pluginA';
 *      readonly parameter?: string;
 *
 *      constructor(args?: { parameter?: string }) {
 *        this.parameter = args?.parameter;
 *      }
 *
 *      isUsable() {
 *        return true;
 *      }
 *    }
 *
 *  And its factory:
 *
 *    const PluginAFactory = (parameter: string) => new PluginA({ parameter });
 *
 *  These would be all valid ways of adding it to the Plugins list:
 *
 *    PluginA
 *    new PluginA()
 *    new PluginA({ parameter: 'parameterValue' })
 *    PluginAFactory('parameterValue')
 *
 *  And it's also possible to define a Plugin on the fly as an Object:
 *
 *    {
 *      pluginName: 'pluginA',
 *      parameter: 'parameterValue',
 *      isUsable: () => true
 *    } as TrackerPlugin
 *
 */
export type TrackerPluginsConfiguration = TrackerPluginConfig & {
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
  readonly console?: TrackerConsole;
  plugins: TrackerPluginInterface[] = [];

  /**
   * Plugins can be lazy. Map through them to instantiate them.
   */
  constructor(trackerPluginsConfig: TrackerPluginsConfiguration) {
    this.console = trackerPluginsConfig.console;

    trackerPluginsConfig.plugins.map((plugin) => this.add(plugin));

    if (this.console) {
      this.console.groupCollapsed(`｢objectiv:TrackerPlugins｣ Initialized`);
      this.console.group(`Plugins:`);
      this.console.log(this.plugins.map((plugin) => plugin.pluginName).join(', '));
      this.console.groupEnd();
      this.console.groupEnd();
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
      throw new Error(`｢objectiv:TrackerPlugins｣ ${pluginName}: not found.`);
    }

    return plugin;
  }

  /**
   * Adds a new Plugin at the end of the plugins list, or at the specified index.
   */
  add(plugin: TrackerPluginInterface, index?: number) {
    if (index !== undefined && !isValidIndex(index)) {
      throw new Error(`｢objectiv:TrackerPlugins｣ invalid index.`);
    }

    const pluginInstance = this.has(plugin.pluginName);

    if (pluginInstance) {
      throw new Error(`｢objectiv:TrackerPlugins｣ ${plugin.pluginName}: already exists. Use "replace" instead.`);
    }

    const spliceIndex = index ?? this.plugins.length;
    this.plugins.splice(index ?? this.plugins.length, 0, plugin);

    if (this.console) {
      this.console.log(
        `%｢objectiv:TrackerPlugins｣ ${plugin.pluginName} added at index ${spliceIndex}.`,
        'font-weight: bold'
      );
    }
  }

  /**
   * Removes a Plugin by its name.
   */
  remove(pluginName: string) {
    const pluginInstance = this.get(pluginName);

    this.plugins = this.plugins.filter(({ pluginName }) => pluginName !== pluginInstance.pluginName);

    if (this.console) {
      this.console.log(`%｢objectiv:TrackerPlugins｣ ${pluginInstance.pluginName} removed.`, 'font-weight: bold');
    }
  }

  /**
   * Replaces a plugin with a new one of the same type at the same index, unless a new index has been specified.
   */
  replace(plugin: TrackerPluginInterface, index?: number) {
    if (index !== undefined && !isValidIndex(index)) {
      throw new Error(`｢objectiv:TrackerPlugins｣ invalid index.`);
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

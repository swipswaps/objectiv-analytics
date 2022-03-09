import {
  ContextsConfig,
  LocationContextValidationRule,
  makeRootLocationContext,
  TrackerConsole,
  TrackerEvent,
  TrackerPluginConfig,
  TrackerPluginInterface,
  TrackerValidationRuleInterface,
} from '@objectiv/tracker-core';
import { makeRootLocationId } from './makeRootLocationId';

/**
 * The configuration object of RootLocationContextFromURLPlugin.
 */
export type RootLocationContextFromURLPluginConfig = TrackerPluginConfig & {
  idFactoryFunction?: typeof makeRootLocationId;
};

/**
 * The RootLocationContextFromURL Plugin factors a RootLocationContext out of the first slug of the current URL.
 * Event Validation: Must be present in Location Stack once at position 0.
 */
export class RootLocationContextFromURLPlugin implements TrackerPluginInterface {
  readonly console?: TrackerConsole;
  readonly pluginName = `RootLocationContextFromURLPlugin`;
  readonly idFactoryFunction: typeof makeRootLocationId;
  readonly validationRules: TrackerValidationRuleInterface[];

  /**
   * The constructor is merely responsible for processing the given TrackerPluginConfiguration `console` parameter.
   */
  constructor(config?: RootLocationContextFromURLPluginConfig) {
    this.console = config?.console;
    this.idFactoryFunction = config?.idFactoryFunction ?? makeRootLocationId;
    this.validationRules = [
      new LocationContextValidationRule({
        console: this.console,
        logPrefix: this.pluginName,
        contextName: 'RootLocationContext',
        once: true,
        position: 0,
      }),
    ];

    if (this.console) {
      this.console.log(`%c｢objectiv:${this.pluginName}｣ Initialized`, 'font-weight: bold');
    }
  }

  /**
   * Generate a fresh RootLocationContext before each TrackerEvent is handed over to the TrackerTransport.
   */
  enrich(contexts: Required<ContextsConfig>): void {
    const rootLocationContextId = this.idFactoryFunction();

    if (rootLocationContextId) {
      contexts.location_stack.unshift(makeRootLocationContext({ id: rootLocationContextId }));
    } else if (this.console) {
      this.console.error(
        `%c｢objectiv:${this.pluginName}｣ Could not generate a RootLocationContext from "${location.pathname}"`,
        'font-weight: bold'
      );
    }
  }

  /**
   * If the Plugin is usable runs all validation rules.
   */
  validate(event: TrackerEvent): void {
    if (this.isUsable()) {
      this.validationRules.forEach((validationRule) => validationRule.validate(event));
    }
  }

  /**
   * Make this plugin usable only on web, eg: Document and Location APIs are both available
   */
  isUsable(): boolean {
    return typeof document !== 'undefined' && typeof document.location !== 'undefined';
  }
}

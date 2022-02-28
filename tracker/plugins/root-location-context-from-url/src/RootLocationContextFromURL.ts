import {
  ContextsConfig,
  ContextType,
  ContextValidationRuleConfig,
  makeRootLocationContext,
  RequiresContextValidationRule,
  TrackerConsole,
  TrackerEvent,
  TrackerPluginConfig,
  TrackerPluginInterface,
  TrackerValidationRuleInterface,
  UniqueContextValidationRule,
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
 *
 * Event Validation:
 *  - Must be present in Location Stack
 *  - TODO: Must be present at position 0
 *  - Must not be present multiple times
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
    const validationRuleConfig: ContextValidationRuleConfig = {
      console: this.console,
      contextName: 'RootLocationContext',
      contextType: ContextType.LocationStack,
    };
    this.validationRules = [
      // TODO: Must be present at position 0
      new RequiresContextValidationRule(validationRuleConfig),
      new UniqueContextValidationRule(validationRuleConfig),
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

import { ResolvableContext } from './ContextResolver';
import { TrackerEvent, TrackerInterface } from './Tracker';

export class StackDecorator implements TrackerInterface {
  constructor(
    private readonly tracker: TrackerInterface,
    private readonly global_contexts: ResolvableContext[],
    private readonly location_stack: ResolvableContext[]
  ) {}

  async trackEvent(event: TrackerEvent) {
    await this.tracker.trackEvent({
      ...event,
      global_contexts: [...(event.global_contexts ?? []), ...this.global_contexts],
      location_stack: [...this.location_stack, ...(event.location_stack ?? [])],
    });
  }

  withContexts(globalContexts: ResolvableContext[], locationStack: ResolvableContext[]) {
    return new StackDecorator(this, globalContexts, locationStack);
  }

  withGlobalContexts(globalContexts: ResolvableContext[]) {
    return new StackDecorator(this, globalContexts, []);
  }

  withLocationStack(locationStack: ResolvableContext[]) {
    return new StackDecorator(this, [], locationStack);
  }
}

import { isNonEmptyArray, NonEmptyArray } from './helpers';
import { TrackerConsole } from './Tracker';
import { TrackerQueue } from './TrackerQueue';
import { TrackerTransportConfig, TrackerTransportInterface, TransportableEvent } from "./TrackerTransportInterface";

/**
 * The configuration object of a TrackerTransportQueued. Requires a Queue and Transport instances.
 */
export type TrackerTransportQueuedConfig = TrackerTransportConfig & {
  queue: TrackerQueue;
  transport: TrackerTransportInterface;
};

/**
 * A TrackerTransport implementation that leverages TrackerQueue to handle events.
 * The queue runner is executed at construction. It's a simplistic implementation for now, just to test the concept.
 */
export class TrackerTransportQueued implements TrackerTransportInterface {
  readonly console?: TrackerConsole;
  readonly transportName = 'TrackerTransportQueued';
  readonly transport: TrackerTransportInterface;
  readonly queue: TrackerQueue;

  constructor(config: TrackerTransportQueuedConfig) {
    this.console = config.console;
    this.transport = config.transport;
    this.queue = config.queue;

    if (this.console) {
      this.console.groupCollapsed(`｢objectiv:${this.transportName}｣ Initialized`);
      this.console.log(`Transport: ${this.transport.transportName}`);
      this.console.log(`Queue: ${this.queue.queueName}`);
      this.console.groupEnd();
    }

    if (this.isUsable()) {
      // Bind the handle function to its Transport instance to preserve its scope
      const processFunction = this.transport.handle.bind(this.transport);

      // Set the queue processFunction to transport.handle method: the queue will run Transport.handle for each batch
      this.queue.setProcessFunction(processFunction);

      // And start the Queue runner
      this.queue.startRunner();

      if (this.console) {
        this.console.log(`%c｢objectiv:${this.transportName}｣ ${this.queue.queueName} runner started`, 'font-weight:bold');
      }
    }
  }

  async handle(...args: NonEmptyArray<TransportableEvent>): Promise<any> {
    return Promise.all(args).then((events) => isNonEmptyArray(events) && this.queue.push(...events));
  }

  isUsable(): boolean {
    return this.transport.isUsable();
  }
}

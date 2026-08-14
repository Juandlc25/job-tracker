type Handler<T> = (payload: T) => void;

export interface TypedEventEmitter<Events extends Record<string, unknown>> {
  on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void;
  off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void;
  emit<K extends keyof Events>(event: K, payload: Events[K]): void;
}

/**
 * Type-safe pub/sub. `Events` maps event names to payload types so `.on`
 * and `.emit` cannot drift. Handlers are stored in a mapped object keyed
 * by event name — no `any` required.
 */
export function createTypedEventEmitter<
  Events extends Record<string, unknown>,
>(): TypedEventEmitter<Events> {
  const listeners: { [K in keyof Events]?: Set<Handler<Events[K]>> } = {};

  return {
    on<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
      const existing = listeners[event];
      if (existing) {
        existing.add(handler);
        return;
      }
      listeners[event] = new Set([handler]);
    },

    off<K extends keyof Events>(event: K, handler: Handler<Events[K]>): void {
      listeners[event]?.delete(handler);
    },

    emit<K extends keyof Events>(event: K, payload: Events[K]): void {
      listeners[event]?.forEach((handler) => {
        handler(payload);
      });
    },
  };
}

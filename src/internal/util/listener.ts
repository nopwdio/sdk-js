export type Listener<T> = (data: T) => void;

export class EventListener<T> {
  private listeners: Set<Listener<T>>;

  constructor() {
    this.listeners = new Set();
  }

  add(listener: Listener<T>) {
    this.listeners.add(listener);
  }

  remove(listener: Listener<T>) {
    this.listeners.delete(listener);
  }

  signal(data: T) {
    this.listeners.forEach((listener) => {
      listener(data);
    });
  }
}

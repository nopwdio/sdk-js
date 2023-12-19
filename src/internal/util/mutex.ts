export class Mutex {
  private current: Promise<void>;
  constructor() {
    this.current = Promise.resolve();
  }

  async lock() {
    let unlock = () => {};
    const next = new Promise<void>((resolve) => (unlock = resolve));
    const rv = this.current.then(() => unlock);
    this.current = next;

    return rv;
  }
}

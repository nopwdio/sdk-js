export class Mutex {
  private locked: boolean;
  private queue: any[];

  constructor() {
    this.locked = false;
    this.queue = [];
  }

  lock() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve(undefined);
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.locked = false;
    }
  }
}

import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonStore {
  constructor(filename) {
    this.filename = filename;
    this.queue = Promise.resolve();
  }

  async read() {
    try {
      return JSON.parse(await fs.readFile(this.filename, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { schemaVersion: 1, entitlements: {}, marketplaceEvents: [] };
      }
      throw error;
    }
  }

  write(mutator) {
    this.queue = this.queue.then(async () => {
      const state = await this.read();
      const next = await mutator(structuredClone(state)) || state;
      await fs.mkdir(path.dirname(this.filename), { recursive: true });
      const temporary = `${this.filename}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, { mode: 0o600 });
      await fs.rename(temporary, this.filename);
      return next;
    });
    return this.queue;
  }

  async recordMarketplaceEvent(event) {
    return this.write((state) => {
      state.marketplaceEvents ??= [];
      state.entitlements ??= {};
      state.marketplaceEvents.push(event);
      if (state.marketplaceEvents.length > 1000) state.marketplaceEvents.splice(0, state.marketplaceEvents.length - 1000);
      if (event.accountId) state.entitlements[String(event.accountId)] = event;
      return state;
    });
  }
}

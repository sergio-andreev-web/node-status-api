import { randomUUID } from 'node:crypto';

const priorities = new Set(['low', 'normal', 'high']);

export class TaskStore {
  #items = new Map();

  create(input) {
    const data = this.#validate(input, false);
    const now = new Date().toISOString();
    const item = { id: randomUUID(), title: data.title, priority: data.priority ?? 'normal', done: false, createdAt: now, updatedAt: now };
    this.#items.set(item.id, item);
    return item;
  }

  get(id) { return this.#items.get(id) ?? null; }

  list({ status, priority, search, limit = 50, offset = 0 } = {}) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('limit must be 1–100');
    if (!Number.isInteger(offset) || offset < 0) throw new RangeError('offset must be non-negative');
    let items = [...this.#items.values()];
    if (status === 'open') items = items.filter(item => !item.done);
    else if (status === 'done') items = items.filter(item => item.done);
    else if (status && status !== 'all') throw new RangeError('status must be open, done or all');
    if (priority) {
      if (!priorities.has(priority)) throw new RangeError('invalid priority');
      items = items.filter(item => item.priority === priority);
    }
    if (search) items = items.filter(item => item.title.toLowerCase().includes(search.toLowerCase()));
    return { total: items.length, items: items.slice(offset, offset + limit) };
  }

  update(id, input) {
    const item = this.get(id);
    if (!item) return null;
    const data = this.#validate(input, true);
    Object.assign(item, data, { updatedAt: new Date().toISOString() });
    return item;
  }

  delete(id) { return this.#items.delete(id); }

  stats() {
    const items = [...this.#items.values()];
    return { total: items.length, open: items.filter(item => !item.done).length, done: items.filter(item => item.done).length };
  }

  #validate(input, partial) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('body must be an object');
    const allowed = partial ? ['title', 'priority', 'done'] : ['title', 'priority'];
    for (const key of Object.keys(input)) if (!allowed.includes(key)) throw new TypeError(`unknown field: ${key}`);
    if (!partial || 'title' in input) {
      if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 120) throw new TypeError('title must be 1–120 characters');
    }
    if ('priority' in input && !priorities.has(input.priority)) throw new TypeError('priority must be low, normal or high');
    if ('done' in input && typeof input.done !== 'boolean') throw new TypeError('done must be boolean');
    if (partial && Object.keys(input).length === 0) throw new TypeError('empty update');
    return { ...input, ...('title' in input ? { title: input.title.trim() } : {}) };
  }
}

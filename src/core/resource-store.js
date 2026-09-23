import { randomUUID } from 'node:crypto';

export class ResourceStore {
  #records = new Map();

  create(fields) {
    const now = new Date().toISOString();
    const record = { id: randomUUID(), ...fields, archived: false, createdAt: now, updatedAt: now };
    this.#records.set(record.id, record);
    return structuredClone(record);
  }

  get(id) {
    const record = this.#records.get(id);
    return record ? structuredClone(record) : null;
  }

  update(id, fields) {
    const record = this.#records.get(id);
    if (!record) return null;
    Object.assign(record, fields, { updatedAt: new Date().toISOString() });
    return structuredClone(record);
  }

  delete(id) { return this.#records.delete(id); }

  all() { return [...this.#records.values()].map(item => structuredClone(item)); }

  query({ search = '', archived = false, limit = 50, offset = 0, sort = 'newest' } = {}) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new RangeError('limit must be 1–100');
    if (!Number.isInteger(offset) || offset < 0) throw new RangeError('offset must be non-negative');
    const needle = search.toLowerCase();
    let records = this.all().filter(item => item.archived === archived && JSON.stringify(item).toLowerCase().includes(needle));
    records.sort((a, b) => sort === 'oldest' ? a.createdAt.localeCompare(b.createdAt) : b.createdAt.localeCompare(a.createdAt));
    return { total: records.length, items: records.slice(offset, offset + limit) };
  }

  countBy(key) {
    const counts = {};
    for (const record of this.#records.values()) {
      const value = String(record[key] ?? 'unset');
      counts[value] = (counts[value] ?? 0) + 1;
    }
    return counts;
  }

  import(records) {
    if (!Array.isArray(records)) throw new TypeError('Expected an array');
    for (const record of records) this.#records.set(record.id, structuredClone(record));
  }
}

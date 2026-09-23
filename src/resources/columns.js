import { ResourceStore } from '../core/resource-store.js';

const schema = Object.freeze({
  name: 'string',
  boardId: 'string',
  color: 'string',
  position: 'number',
  active: 'boolean',
});
const fieldNames = Object.keys(schema);

function validate(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('columns input must be an object');
  }
  const result = {};
  for (const key of Object.keys(input)) {
    if (!fieldNames.includes(key)) throw new TypeError(`Unknown columns field: ${key}`);
    const kind = schema[key];
    const value = input[key];
    if (kind === 'string') {
      if (typeof value !== 'string' || value.trim().length === 0 || value.length > 500) {
        throw new TypeError(`${key} must be a non-empty string under 500 characters`);
      }
      result[key] = value.trim();
    } else if (kind === 'number') {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
        throw new TypeError(`${key} must be a non-negative finite number`);
      }
      result[key] = value;
    } else if (kind === 'boolean') {
      if (typeof value !== 'boolean') throw new TypeError(`${key} must be boolean`);
      result[key] = value;
    }
  }
  if (!partial && !(firstKey in result)) throw new TypeError(`name is required`);
  if (partial && Object.keys(result).length === 0) throw new TypeError('Empty update');
  return result;
}

const firstKey = 'name';

export class ColumnsRepository {
  constructor(store = new ResourceStore()) {
    this.store = store;
  }

  create(input) {
    return this.store.create(validate(input));
  }

  get(id) {
    return this.store.get(id);
  }

  update(id, changes) {
    return this.store.update(id, validate(changes, true));
  }

  delete(id) {
    return this.store.delete(id);
  }

  list(options = {}) {
    return this.store.query(options);
  }

  search(text, options = {}) {
    return this.list({ ...options, search: text });
  }

  recent(limit = 10) {
    return this.list({ limit, sort: 'newest' }).items;
  }

  archive(id) {
    return this.store.update(id, { archived: true });
  }

  restore(id) {
    return this.store.update(id, { archived: false });
  }

  duplicate(id) {
    const original = this.get(id);
    if (!original) return null;
    const fields = Object.fromEntries(fieldNames.filter(key => key in original).map(key => [key, original[key]]));
    fields[firstKey] = `${fields[firstKey]} (copy)`;
    return this.create(fields);
  }

  countBy(field) {
    if (!fieldNames.includes(field)) throw new TypeError(`Unknown field: ${field}`);
    return this.store.countBy(field);
  }

  stats() {
    const all = this.store.all();
    return { total: all.length, active: all.filter(item => !item.archived).length, archived: all.filter(item => item.archived).length };
  }

  export() {
    return JSON.stringify(this.store.all(), null, 2);
  }

  import(json) {
    const records = JSON.parse(json);
    if (!Array.isArray(records)) throw new TypeError('Expected an array');
    this.store.import(records);
    return records.length;
  }
}

export const resourceName = 'columns';
export const resourceSchema = schema;

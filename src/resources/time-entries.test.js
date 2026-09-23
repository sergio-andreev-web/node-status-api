import test from 'node:test';
import assert from 'node:assert/strict';
import { TimeEntriesRepository } from './time-entries.js';

test('timeEntries lifecycle', () => {
  const repository = new TimeEntriesRepository();
  const created = repository.create({ name: 'Example', taskId: 'value', userId: 'value', minutes: 1, billable: true });
  assert.ok(created.id);
  assert.equal(repository.list().total, 1);
  assert.equal(repository.get(created.id).name, 'Example');
  assert.equal(repository.search('example').total, 1);
  const duplicate = repository.duplicate(created.id);
  assert.ok(duplicate.id !== created.id);
  assert.equal(repository.stats().total, 2);
  repository.archive(created.id);
  assert.equal(repository.stats().archived, 1);
  repository.restore(created.id);
  assert.equal(repository.stats().archived, 0);
  assert.equal(repository.delete(created.id), true);
});

test('timeEntries input validation', () => {
  const repository = new TimeEntriesRepository();
  assert.throws(() => repository.create({}));
  assert.throws(() => repository.create({ name: '   ' }));
  assert.throws(() => repository.create({ name: 'ok', unknown: true }));
});

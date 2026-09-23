import test from 'node:test';
import assert from 'node:assert/strict';
import { DashboardsRepository } from './dashboards.js';

test('dashboards lifecycle', () => {
  const repository = new DashboardsRepository();
  const created = repository.create({ name: 'Example', teamId: 'value', layout: 'value', widgetCount: 1, public: true });
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

test('dashboards input validation', () => {
  const repository = new DashboardsRepository();
  assert.throws(() => repository.create({}));
  assert.throws(() => repository.create({ name: '   ' }));
  assert.throws(() => repository.create({ name: 'ok', unknown: true }));
});

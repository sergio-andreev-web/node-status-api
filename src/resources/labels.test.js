import test from 'node:test';
import assert from 'node:assert/strict';
import { LabelsRepository } from './labels.js';

test('labels lifecycle', () => {
  const repository = new LabelsRepository();
  const created = repository.create({ name: 'Example', projectId: 'value', color: 'value', position: 1, active: true });
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

test('labels input validation', () => {
  const repository = new LabelsRepository();
  assert.throws(() => repository.create({}));
  assert.throws(() => repository.create({ name: '   ' }));
  assert.throws(() => repository.create({ name: 'ok', unknown: true }));
});

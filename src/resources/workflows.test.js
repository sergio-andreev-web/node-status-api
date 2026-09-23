import test from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowsRepository } from './workflows.js';

test('workflows lifecycle', () => {
  const repository = new WorkflowsRepository();
  const created = repository.create({ name: 'Example', projectId: 'value', trigger: 'value', runCount: 1, enabled: true });
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

test('workflows input validation', () => {
  const repository = new WorkflowsRepository();
  assert.throws(() => repository.create({}));
  assert.throws(() => repository.create({ name: '   ' }));
  assert.throws(() => repository.create({ name: 'ok', unknown: true }));
});

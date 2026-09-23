from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SPECS = {
    'projects': ['name:string', 'summary:string', 'ownerId:string', 'budget:number', 'active:boolean'],
    'teams': ['name:string', 'department:string', 'leadId:string', 'capacity:number', 'active:boolean'],
    'memberships': ['name:string', 'teamId:string', 'userId:string', 'role:string', 'active:boolean'],
    'boards': ['name:string', 'projectId:string', 'description:string', 'position:number', 'active:boolean'],
    'columns': ['name:string', 'boardId:string', 'color:string', 'position:number', 'active:boolean'],
    'subtasks': ['name:string', 'taskId:string', 'assigneeId:string', 'estimate:number', 'done:boolean'],
    'checklists': ['name:string', 'taskId:string', 'description:string', 'position:number', 'done:boolean'],
    'labels': ['name:string', 'projectId:string', 'color:string', 'position:number', 'active:boolean'],
    'comments': ['name:string', 'taskId:string', 'authorId:string', 'reactions:number', 'pinned:boolean'],
    'attachments': ['name:string', 'taskId:string', 'url:string', 'size:number', 'active:boolean'],
    'milestones': ['name:string', 'projectId:string', 'dueDate:string', 'progress:number', 'done:boolean'],
    'sprints': ['name:string', 'projectId:string', 'startDate:string', 'velocity:number', 'active:boolean'],
    'iterations': ['name:string', 'sprintId:string', 'goal:string', 'capacity:number', 'done:boolean'],
    'releases': ['name:string', 'projectId:string', 'version:string', 'build:number', 'published:boolean'],
    'goals': ['name:string', 'teamId:string', 'description:string', 'target:number', 'done:boolean'],
    'timeEntries': ['name:string', 'taskId:string', 'userId:string', 'minutes:number', 'billable:boolean'],
    'expenses': ['name:string', 'projectId:string', 'category:string', 'amount:number', 'approved:boolean'],
    'schedules': ['name:string', 'teamId:string', 'timezone:string', 'hours:number', 'active:boolean'],
    'reminders': ['name:string', 'taskId:string', 'userId:string', 'delayMinutes:number', 'sent:boolean'],
    'notifications': ['name:string', 'userId:string', 'channel:string', 'attempts:number', 'read:boolean'],
    'activities': ['name:string', 'actorId:string', 'subjectId:string', 'sequence:number', 'visible:boolean'],
    'webhooks': ['name:string', 'projectId:string', 'url:string', 'retries:number', 'active:boolean'],
    'integrations': ['name:string', 'projectId:string', 'provider:string', 'syncCount:number', 'active:boolean'],
    'templates': ['name:string', 'projectId:string', 'description:string', 'uses:number', 'active:boolean'],
    'workflows': ['name:string', 'projectId:string', 'trigger:string', 'runCount:number', 'enabled:boolean'],
    'dashboards': ['name:string', 'teamId:string', 'layout:string', 'widgetCount:number', 'public:boolean'],
    'widgets': ['name:string', 'dashboardId:string', 'kind:string', 'position:number', 'visible:boolean'],
    'folders': ['name:string', 'workspaceId:string', 'parentId:string', 'position:number', 'public:boolean'],
    'links': ['name:string', 'taskId:string', 'url:string', 'clicks:number', 'active:boolean'],
    'contacts': ['name:string', 'email:string', 'teamId:string', 'touches:number', 'active:boolean'],
    'auditLogs': ['name:string', 'actorId:string', 'action:string', 'sequence:number', 'visible:boolean'],
    'dependencies': ['name:string', 'taskId:string', 'dependsOnId:string', 'lagDays:number', 'resolved:boolean'],
    'savedViews': ['name:string', 'ownerId:string', 'query:string', 'uses:number', 'public:boolean'],
    'workspaces': ['name:string', 'ownerId:string', 'plan:string', 'seats:number', 'active:boolean'],
    'invitations': ['name:string', 'email:string', 'teamId:string', 'attempts:number', 'accepted:boolean'],
}


def kebab(name):
    return re.sub(r'(?<!^)(?=[A-Z])', '-', name).lower()


for name, raw_fields in SPECS.items():
    fields = [tuple(field.split(':')) for field in raw_fields]
    class_name = name[0].upper() + name[1:] + 'Repository'
    schema = ',\n'.join(f"  {key}: '{kind}'" for key, kind in fields)
    first = fields[0][0]
    example = "{ name: 'Example', " + ', '.join(
        f"{key}: " + ({'string': "'value'", 'number': '1', 'boolean': 'true'}[kind]) for key, kind in fields[1:]
    ) + ' }'
    content = f'''import {{ ResourceStore }} from '../core/resource-store.js';

const schema = Object.freeze({{
{schema},
}});
const fieldNames = Object.keys(schema);

function validate(input, partial = false) {{
  if (!input || typeof input !== 'object' || Array.isArray(input)) {{
    throw new TypeError('{name} input must be an object');
  }}
  const result = {{}};
  for (const key of Object.keys(input)) {{
    if (!fieldNames.includes(key)) throw new TypeError(`Unknown {name} field: ${{key}}`);
    const kind = schema[key];
    const value = input[key];
    if (kind === 'string') {{
      if (typeof value !== 'string' || value.trim().length === 0 || value.length > 500) {{
        throw new TypeError(`${{key}} must be a non-empty string under 500 characters`);
      }}
      result[key] = value.trim();
    }} else if (kind === 'number') {{
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {{
        throw new TypeError(`${{key}} must be a non-negative finite number`);
      }}
      result[key] = value;
    }} else if (kind === 'boolean') {{
      if (typeof value !== 'boolean') throw new TypeError(`${{key}} must be boolean`);
      result[key] = value;
    }}
  }}
  if (!partial && !(firstKey in result)) throw new TypeError(`{first} is required`);
  if (partial && Object.keys(result).length === 0) throw new TypeError('Empty update');
  return result;
}}

const firstKey = '{first}';

export class {class_name} {{
  constructor(store = new ResourceStore()) {{
    this.store = store;
  }}

  create(input) {{
    return this.store.create(validate(input));
  }}

  get(id) {{
    return this.store.get(id);
  }}

  update(id, changes) {{
    return this.store.update(id, validate(changes, true));
  }}

  delete(id) {{
    return this.store.delete(id);
  }}

  list(options = {{}}) {{
    return this.store.query(options);
  }}

  search(text, options = {{}}) {{
    return this.list({{ ...options, search: text }});
  }}

  recent(limit = 10) {{
    return this.list({{ limit, sort: 'newest' }}).items;
  }}

  archive(id) {{
    return this.store.update(id, {{ archived: true }});
  }}

  restore(id) {{
    return this.store.update(id, {{ archived: false }});
  }}

  duplicate(id) {{
    const original = this.get(id);
    if (!original) return null;
    const fields = Object.fromEntries(fieldNames.filter(key => key in original).map(key => [key, original[key]]));
    fields[firstKey] = `${{fields[firstKey]}} (copy)`;
    return this.create(fields);
  }}

  countBy(field) {{
    if (!fieldNames.includes(field)) throw new TypeError(`Unknown field: ${{field}}`);
    return this.store.countBy(field);
  }}

  stats() {{
    const all = this.store.all();
    return {{ total: all.length, active: all.filter(item => !item.archived).length, archived: all.filter(item => item.archived).length }};
  }}

  export() {{
    return JSON.stringify(this.store.all(), null, 2);
  }}

  import(json) {{
    const records = JSON.parse(json);
    if (!Array.isArray(records)) throw new TypeError('Expected an array');
    this.store.import(records);
    return records.length;
  }}
}}

export const resourceName = '{name}';
export const resourceSchema = schema;
'''
    path = ROOT / 'src' / 'resources' / f'{kebab(name)}.js'
    path.write_text(content)
    test = f'''import test from 'node:test';
import assert from 'node:assert/strict';
import {{ {class_name} }} from './{kebab(name)}.js';

test('{name} lifecycle', () => {{
  const repository = new {class_name}();
  const created = repository.create({example});
  assert.ok(created.id);
  assert.equal(repository.list().total, 1);
  assert.equal(repository.get(created.id).{first}, 'Example');
  assert.equal(repository.search('example').total, 1);
  const duplicate = repository.duplicate(created.id);
  assert.ok(duplicate.id !== created.id);
  assert.equal(repository.stats().total, 2);
  repository.archive(created.id);
  assert.equal(repository.stats().archived, 1);
  repository.restore(created.id);
  assert.equal(repository.stats().archived, 0);
  assert.equal(repository.delete(created.id), true);
}});

test('{name} input validation', () => {{
  const repository = new {class_name}();
  assert.throws(() => repository.create({{}}));
  assert.throws(() => repository.create({{ {first}: '   ' }}));
  assert.throws(() => repository.create({{ {first}: 'ok', unknown: true }}));
}});
'''
    (ROOT / 'src' / 'resources' / f'{kebab(name)}.test.js').write_text(test)

imports = '\n'.join(f"import {{ {name[0].upper()+name[1:]}Repository }} from './{kebab(name)}.js';" for name in SPECS)
entries = ',\n'.join(f'  {name}: new {name[0].upper()+name[1:]}Repository()' for name in SPECS)
(ROOT/'src/resources/index.js').write_text(imports + '\n\nexport const resources = {\n' + entries + '\n};\n')
print(f'Generated {len(SPECS)} repositories')

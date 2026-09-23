import { ProjectsRepository } from './projects.js';
import { TeamsRepository } from './teams.js';
import { MembershipsRepository } from './memberships.js';
import { BoardsRepository } from './boards.js';
import { ColumnsRepository } from './columns.js';
import { SubtasksRepository } from './subtasks.js';
import { ChecklistsRepository } from './checklists.js';
import { LabelsRepository } from './labels.js';
import { CommentsRepository } from './comments.js';
import { AttachmentsRepository } from './attachments.js';
import { MilestonesRepository } from './milestones.js';
import { SprintsRepository } from './sprints.js';
import { IterationsRepository } from './iterations.js';
import { ReleasesRepository } from './releases.js';
import { GoalsRepository } from './goals.js';
import { TimeEntriesRepository } from './time-entries.js';
import { ExpensesRepository } from './expenses.js';
import { SchedulesRepository } from './schedules.js';
import { RemindersRepository } from './reminders.js';
import { NotificationsRepository } from './notifications.js';
import { ActivitiesRepository } from './activities.js';
import { WebhooksRepository } from './webhooks.js';
import { IntegrationsRepository } from './integrations.js';
import { TemplatesRepository } from './templates.js';
import { WorkflowsRepository } from './workflows.js';
import { DashboardsRepository } from './dashboards.js';
import { WidgetsRepository } from './widgets.js';
import { FoldersRepository } from './folders.js';
import { LinksRepository } from './links.js';
import { ContactsRepository } from './contacts.js';
import { AuditLogsRepository } from './audit-logs.js';
import { DependenciesRepository } from './dependencies.js';
import { SavedViewsRepository } from './saved-views.js';
import { WorkspacesRepository } from './workspaces.js';
import { InvitationsRepository } from './invitations.js';

export const resources = {
  projects: new ProjectsRepository(),
  teams: new TeamsRepository(),
  memberships: new MembershipsRepository(),
  boards: new BoardsRepository(),
  columns: new ColumnsRepository(),
  subtasks: new SubtasksRepository(),
  checklists: new ChecklistsRepository(),
  labels: new LabelsRepository(),
  comments: new CommentsRepository(),
  attachments: new AttachmentsRepository(),
  milestones: new MilestonesRepository(),
  sprints: new SprintsRepository(),
  iterations: new IterationsRepository(),
  releases: new ReleasesRepository(),
  goals: new GoalsRepository(),
  timeEntries: new TimeEntriesRepository(),
  expenses: new ExpensesRepository(),
  schedules: new SchedulesRepository(),
  reminders: new RemindersRepository(),
  notifications: new NotificationsRepository(),
  activities: new ActivitiesRepository(),
  webhooks: new WebhooksRepository(),
  integrations: new IntegrationsRepository(),
  templates: new TemplatesRepository(),
  workflows: new WorkflowsRepository(),
  dashboards: new DashboardsRepository(),
  widgets: new WidgetsRepository(),
  folders: new FoldersRepository(),
  links: new LinksRepository(),
  contacts: new ContactsRepository(),
  auditLogs: new AuditLogsRepository(),
  dependencies: new DependenciesRepository(),
  savedViews: new SavedViewsRepository(),
  workspaces: new WorkspacesRepository(),
  invitations: new InvitationsRepository()
};

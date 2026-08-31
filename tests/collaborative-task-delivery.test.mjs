import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../app/components/SetApp.js', import.meta.url), 'utf8');
const route = fs.readFileSync(new URL('../app/api/tasks/notify-completion/route.js', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../supabase/migrations/010_collaborative_tasks_notifications.sql', import.meta.url), 'utf8');

test('tasks support project filtering and deliverables',()=>{
  assert.match(app,/All projects/);
  assert.match(app,/Deliverable/);
  assert.match(app,/Attach finished file/);
  assert.match(app,/Activity/);
});
test('completion triggers team notification route',()=>{
  assert.match(app,/\/api\/tasks\/notify-completion/);
  assert.match(route,/sendTransactionalEmail/);
  assert.match(route,/attachments/);
});
test('cloud schema includes collaborative task entities',()=>{
  for(const name of ['project_tasks','task_assignees','task_comments','task_activity','task_deliverables','notification_subscriptions']) assert.match(migration,new RegExp(name));
});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
const sync=fs.readFileSync(new URL('../lib/cloud-sync.js',import.meta.url),'utf8');
const mig=fs.readFileSync(new URL('../supabase/migrations/011_cloud_realtime_workspace.sql',import.meta.url),'utf8');
test('RC6 wires core Supabase realtime sync',()=>{assert.match(app,/useCloudCoreSync/);assert.match(sync,/postgres_changes/);assert.match(sync,/tasks/)});
test('RC6 cloud collections back clients contacts network and team',()=>{for(const k of ['clients','contacts','network','team'])assert.match(app,new RegExp(`kind:'${k}'`))});
test('RC6 uploads project files to private Supabase Storage',()=>{assert.match(app,/storage\.from\('set-project-files'\)/);assert.match(mig,/project_files/);assert.match(mig,/storage\.buckets/)});
test('RC6 adds project invitations and realtime publication',()=>{assert.match(mig,/project_invites/);assert.match(mig,/accept_project_invite/);assert.match(mig,/supabase_realtime/)});

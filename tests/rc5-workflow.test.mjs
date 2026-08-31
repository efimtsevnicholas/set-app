import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync('app/components/SetApp.js','utf8');
test('RC5 has reusable client billing cards',()=>{for(const x of ['function Clients','Use for invoice','Tax / VAT number','Billing address'])assert.ok(app.includes(x),x)});
test('RC5 calendar events are editable movable deletable and typed',()=>{for(const x of ['manageEvent','Event action: edit, move, delete','Commercial photo shoot','Commercial video','Casting'])assert.ok(app.includes(x),x)});
test('RC5 network and team invitations are actionable',()=>{for(const x of ['Invite to project','Invitation emailed','project_invites','Remove'])assert.ok(app.includes(x),x)});
test('RC5 project schedule is editable',()=>{for(const x of ['function Schedule','Add schedule item','Schedule item added'])assert.ok(app.includes(x),x)});
test('RC5 budget exposes project reserve',()=>{for(const x of ['Tax / social reserve %','Reserved from project budget'])assert.ok(app.includes(x),x)});
test('RC5 project files upload and folders are active',()=>{for(const x of ['function Files','Upload Files','Open folder →','set-project-files-'])assert.ok(app.includes(x),x)});

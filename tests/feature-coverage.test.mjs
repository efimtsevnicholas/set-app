import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../app/components/SetApp.js', import.meta.url),'utf8');
const style=fs.readFileSync(new URL('../app/style.css', import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url),'utf8'));

test('release version is v1 RC',()=>assert.equal(pkg.version,'1.0.0-rc.3'));
test('project cards expose requested actions',()=>{
 for(const s of ['Rename','Share','Copy project link','Delete project','project-more']) assert.ok(app.includes(s),s);
});
test('contacts support manual and phone/database import',()=>{
 for(const s of ['Add contact','Import from phone','Import database','parseCsvContacts','parseVcardContacts']) assert.ok(app.includes(s),s);
});
test('moodboard/casting support multi-source media and PDF selection',()=>{
 for(const s of ['Computer / phone','Google Drive','Dropbox','Selected only','Export PDF','FINAL CASTING SELECTION','FINAL MOODBOARD SELECTION']) assert.ok(app.includes(s),s);
});
test('messages expose WhatsApp Telegram Email channels',()=>{
 for(const s of ['WhatsApp','Telegram','Email','Unified inbox','/api/messages/send']) assert.ok(app.includes(s),s);
});
test('calendar hub exposes major providers',()=>{
 for(const s of ['Google Calendar','Apple / iCloud','Outlook / Microsoft 365','Yahoo Calendar','Setmore','Create & sync']) assert.ok(app.includes(s),s);
});
test('Helvetica Neue remains global visual stack',()=>assert.ok(style.includes("'Helvetica Neue',Helvetica,Arial,sans-serif")));


test('tasks support collaboration progress comments checklist and deletion',()=>{
  assert.match(app,/assignees/);
  assert.match(app,/Progress/);
  assert.match(app,/Comments/);
  assert.match(app,/Checklist/);
  assert.match(app,/Task deleted/);
  assert.match(app,/Assigned to me/);
});

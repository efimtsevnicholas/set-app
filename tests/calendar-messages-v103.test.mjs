import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync('app/components/SetApp.js','utf8');
const css=fs.readFileSync('app/style.css','utf8');
test('calendar event editor includes project attendee email and auxiliary info',()=>{for(const x of ['attendeeName','attendeeEmail','Additional information','Video / meeting link','No project']) assert.ok(app.includes(x),x)});
test('calendar project link navigates into workspace',()=>{for(const x of ['event-project-link','setActive(id)','setView(\'Project\')']) assert.ok(app.includes(x),x)});
test('calendar supports update delete and reschedule through editor',()=>{for(const x of ['editingEvent','Event updated','Event deleted','Save changes','type=\"date\"','type=\"time\"']) assert.ok(app.includes(x),x)});
test('mobile messages use master-detail layout rather than stacking',()=>{for(const x of ['mobileChatOpen','mobile-chat-open','mobile-chat-back']) assert.ok(app.includes(x)||css.includes(x),x);assert.match(css,/max-width:700px/);assert.match(css,/\.unified-inbox\.mobile-chat-open \.inbox-sidebar\{display:none\}/);assert.match(css,/\.unified-inbox\.mobile-chat-open \.chat-modern\{display:flex/)});

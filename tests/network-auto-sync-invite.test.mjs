import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
test('manual Link Contact UI is removed',()=>{assert.equal(app.includes('Link contact by email or exact name'),false);assert.equal(app.includes('Change linked contact'),false);assert.equal(app.includes('>Link contact<'),false)});
test('Network automatically syncs from Contacts',()=>{for(const x of ['contactId:c.id','Synced with Contacts automatically',"contacts.find(c=>(p.email&&c.email","contacts.find(c=>c.name?.trim().toLowerCase()===p.name?.trim().toLowerCase())"])assert.ok(app.includes(x),x)});
test('Invite to project requests email and calls invite API',()=>{for(const x of ['NetworkInviteModal',"fetch('/api/projects/invite'",'Email address','Send invitation','title="Invite to project"'])assert.ok(app.includes(x),x)});

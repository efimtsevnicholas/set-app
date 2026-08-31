import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
test('Network uses same cloud Contacts collection',()=>{
 assert.ok(app.includes("useCloudCollection({kind:'contacts',localKey:'set-contacts',seed:seedContacts})"));
 for (const token of ["contactId:c.id","person.photo?<img","mailto:","tel:","Synced with Contacts"]) assert.ok(app.includes(token),token);
});

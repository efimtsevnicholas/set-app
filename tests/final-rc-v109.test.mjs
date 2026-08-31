import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
test('final RC version',()=>assert.equal(pkg.version,'1.0.0'));
test('critical surfaces present',()=>{for(const x of ['Moodboard','Schedule','Calendar','Clients','Contacts','Network','Finance','Tasks','CallSheet'])assert.ok(app.includes(x),x)});

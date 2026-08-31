import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const src=fs.readFileSync('app/components/SetApp.js','utf8');
test('task visible filter closes filter call before semicolon',()=>{
  const line=src.split('\n').find(x=>x.includes('const visible=tasks.filter'));
  assert.ok(line);
  let depth=0;
  for (const ch of line.slice(line.indexOf('tasks.filter'))) {
    if(ch==='(') depth++; else if(ch===')') depth--;
  }
  assert.equal(depth,0);
  assert.match(line,/\)\);\s*$/);
});

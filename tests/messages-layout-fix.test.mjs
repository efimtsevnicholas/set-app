import test from'node:test';import assert from'node:assert/strict';import fs from'node:fs';
const css=fs.readFileSync(new URL('../app/style.css',import.meta.url),'utf8');
test('message conversation rows are full-width stable grid',()=>{for(const x of ['.unified-inbox .conversation-list>.conversation','grid-template-columns:56px minmax(0,1fr) 54px!important','width:100%!important','text-overflow:ellipsis!important'])assert.ok(css.includes(x),x)});
test('active message row keeps same geometry',()=>{assert.ok(css.includes('.unified-inbox .conversation-list>.conversation.active'));assert.ok(css.includes('border-left:4px solid #e10600!important'))});

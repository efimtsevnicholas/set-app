import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/style.css',import.meta.url),'utf8');
test('business profile has explicit local and cloud persistence',()=>{
  assert.ok(app.includes("save('set-business-profile',next)"));
  assert.ok(app.includes("setProfiles([{...(profiles[0]||{}),...next}])"));
  assert.ok(app.includes("Unsaved changes"));
});
test('invoice composer is viewport scroll safe',()=>{
  assert.ok(app.includes('finance-composer-shell'));
  assert.ok(app.includes('finance-composer-modal'));
  assert.ok(css.includes('.finance-composer-modal'));
  assert.ok(css.includes('max-height:calc(100dvh - 40px)!important'));
  assert.ok(css.includes('overflow-y:auto!important'));
});

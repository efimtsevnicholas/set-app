import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../app/style.css',import.meta.url),'utf8');
const layout=readFileSync(new URL('../app/layout.js',import.meta.url),'utf8');

test('viewport supports device width and iPhone safe areas',()=>{
  assert.match(layout,/width:'device-width'/);
  assert.match(layout,/viewportFit:'cover'/);
  assert.match(css,/env\(safe-area-inset-bottom\)/);
});

test('responsive matrix covers tablet, phone, narrow phone and landscape',()=>{
  for (const q of ['max-width:1280px','max-width:1024px','max-width:900px','max-width:700px','max-width:480px','max-width:374px','max-height:520px']) assert.ok(css.includes(q),q);
});

test('touch targets and mobile form zoom protections are present',()=>{
  assert.match(css,/pointer:coarse/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/input,select,textarea\{font-size:16px!important\}/);
});

test('high-risk workspaces get mobile overflow/layout handling',()=>{
  for (const token of ['.calendar-grid','.budget-table','.schedule','.modal>div','.media-grid.casting-media','.network-grid','.callsheet-map']) assert.ok(css.includes(token),token);
});

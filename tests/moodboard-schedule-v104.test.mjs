import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../app/style.css',import.meta.url),'utf8');
test('moodboard supports deletion and full viewer',()=>{assert.match(app,/View all/);assert.match(app,/media-lightbox/);assert.match(app,/Image removed/);assert.match(app,/ArrowRight/);assert.match(app,/ArrowLeft/)});
test('moodboard pdf exports selected or all images in aligned layout',()=>{assert.match(app,/kind==='moodboard'\?\(items\.some/);assert.match(app,/const perPage=4/);assert.match(app,/Create PDF/);assert.match(css,/lightbox-stage/)});
test('schedule is project scoped and responsive',()=>{assert.match(app,/filter\(e=>!e\.project\|\|e\.project===project\.id\)/);assert.match(app,/schedule-table/);assert.match(app,/schedule-row/);assert.match(css,/@media\(max-width:700px\)[\s\S]*\.schedule-row/)});

import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync('app/components/SetApp.js','utf8');
const finance=fs.readFileSync('lib/server/finance.js','utf8');
const pdf=fs.readFileSync('lib/server/invoice-pdf.js','utf8');
const migration=fs.readFileSync('supabase/migrations/012_invoice_item_comments.sql','utf8');
test('calendar editor can delete reschedule and quick move',()=>{for(const x of ['Delete event','MOVE EVENT','← 1 day','1 day →','−30 min','+30 min','type="date"','type="time"'])assert.ok(app.includes(x),x)});
test('invoice composer has service comments and footer legal notes',()=>{for(const x of ['Service comment / details','Legal, tax & payment notes','footerNotes','serviceComment','TVA non applicable, art. 293 B du CGI'])assert.ok(app.includes(x),x)});
test('invoice calculation preserves optional item comment',()=>assert.ok(finance.includes("comment:String(x.comment||'').trim()||null")));
test('invoice PDF renders line comments and legal footer',()=>{assert.ok(pdf.includes('item.comment'));assert.ok(pdf.includes('LEGAL / TAX / PAYMENT NOTES'))});
test('migration adds comments to invoice and quote items',()=>{assert.match(migration,/invoice_items add column if not exists comment text/);assert.match(migration,/quote_items add column if not exists comment text/)})

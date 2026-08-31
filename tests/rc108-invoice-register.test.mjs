import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync(new URL('../app/components/SetApp.js',import.meta.url),'utf8');
const summary=fs.readFileSync(new URL('../app/api/finance/summary/route.js',import.meta.url),'utf8');
const route=fs.readFileSync(new URL('../app/api/invoices/[id]/route.js',import.meta.url),'utf8');
test('Finance keeps persistent invoice register with edit PDF email and status',()=>{for(const x of ['Invoice register','Email PDF','setInvoiceStatus','invoice={composer.invoice||null}','Save changes'])assert.ok(app.includes(x),x)});
test('Invoice summary hydrates items for editing',()=>assert.ok(summary.includes("select('*,invoice_items(*)')")));
test('Invoice API edits/status changes are audited',()=>{for(const x of ['export async function PUT','export async function PATCH',"action:'edited'","action:'status_changed'","from('invoice_items').delete()"])assert.ok(route.includes(x),x)});

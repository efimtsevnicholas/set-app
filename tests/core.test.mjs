import test from 'node:test'; import assert from 'node:assert/strict';
import { yearlySavingPercent, hasProAccess } from '../lib/billing.js';
import { calculateTaxReserve, calculateLatePayment } from '../lib/finance-rules.js';

test('yearly plan saves 17%',()=>assert.equal(yearlySavingPercent(999,9999),17));
test('trial grants access before expiry',()=>assert.equal(hasProAccess({status:'trialing',trial_ends_at:'2099-01-01T00:00:00Z'}),true));
test('expired trial blocks access',()=>assert.equal(hasProAccess({status:'trialing',trial_ends_at:'2020-01-01T00:00:00Z'}),false));
test('tax reserve math',()=>assert.equal(calculateTaxReserve({turnover:1000,socialRate:21.2,cfpRate:.3}).reserve,215));
test('late payment adds B2B recovery fee',()=>{const r=calculateLatePayment({principal:1000,dueDate:'2026-01-01',annualRate:10,asOf:new Date('2026-01-12T12:00:00Z')});assert.equal(r.recoveryFee,40);assert.ok(r.totalDue>1040)});

import {computeDocumentTotals, addDays} from '../lib/server/finance.js';
test('commercial document totals include VAT',()=>{const x=computeDocumentTotals([{description:'Shoot',quantity:2,unit_price:500,vat_rate:20}]);assert.equal(x.subtotal,1000);assert.equal(x.vat,200);assert.equal(x.total,1200)});
test('payment due dates are deterministic',()=>assert.equal(addDays('2026-08-31',30),'2026-09-30'));

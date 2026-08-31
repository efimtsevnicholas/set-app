import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const auth = fs.readFileSync(new URL('../lib/server/auth.js', import.meta.url), 'utf8');
const middleware = fs.readFileSync(new URL('../middleware.js', import.meta.url), 'utf8');

test('Server Component auth does not crash when cookie writes are forbidden', () => {
  assert.match(auth, /setAll\(values\)/);
  assert.match(auth, /try\s*\{/);
  assert.match(auth, /catch\s*\{/);
});

test('middleware persists Supabase refreshed auth cookies', () => {
  assert.match(middleware, /response\.cookies\.set/);
  assert.match(middleware, /await supabase\.auth\.getUser\(\)/);
});

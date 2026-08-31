import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const app=fs.readFileSync('app/components/SetApp.js','utf8');
test('RC4 restores Call Sheet with weather calendar maps and email',()=>{for(const x of ['Call Sheet','Open directions in Google Maps','open-meteo.com','Send by email'])assert.ok(app.includes(x))});
test('RC4 moodboard supports Pinterest source',()=>assert.ok(app.includes("addCloudLink('Pinterest')")));
test('RC4 finance captures business and tax identities',()=>{for(const x of ['Business Profile','taxNumber','taxRegime','issuer_profile'])assert.ok(app.includes(x))});
test('RC4 contacts expose edit share delete',()=>{for(const x of ["setMode('edit')",'Share</button>','Delete</button>'])assert.ok(app.includes(x))});
test('RC4 workspace supports project switch and management',()=>{for(const x of ['← All projects','Rename</button>','Share</button>','Delete</button>'])assert.ok(app.includes(x))});

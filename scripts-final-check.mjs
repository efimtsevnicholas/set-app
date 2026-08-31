import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const required=[
  'app/components/SetApp.js',
  'app/api/messages/send/route.js',
  'app/api/calendar/connect/google/route.js',
  'app/api/calendar/connect/microsoft/route.js',
  'app/api/calendar/connect/setmore/route.js',
  'app/api/calendar/sync/route.js',
  'app/api/billing/checkout/route.js',
  'app/api/billing/webhook/route.js',
  'supabase/migrations/009_calendar_booking_hub.sql',
  'docs/FINAL_RELEASE_AUDIT.md'
];
for(const f of required){ if(!fs.existsSync(path.join(root,f))) throw new Error(`Missing required release file: ${f}`); }
const app=fs.readFileSync(path.join(root,'app/components/SetApp.js'),'utf8');
const checks={
  'project menu':['Rename','Copy project link','Delete project','navigator.share'],
  'contacts imports':['Import from phone','Import database','parseVcardContacts','parseCsvContacts'],
  'media selections':['Google Drive','Dropbox','Export PDF','Selected only'],
  'unified messaging':['WhatsApp','Telegram','Email','/api/messages/send'],
  'calendar hub':['Google Calendar','Apple / iCloud','Outlook / Microsoft 365','Yahoo Calendar','Setmore','Create & sync'],
  'typography':["'Helvetica Neue'"],
};
for(const [name,needles] of Object.entries(checks)) for(const n of needles) if(!app.includes(n) && !(name==='typography' && fs.readFileSync(path.join(root,'app/style.css'),'utf8').includes(n))) throw new Error(`Feature coverage failed: ${name} missing ${n}`);
const env=fs.readFileSync(path.join(root,'.env.example'),'utf8');
for(const key of ['STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','SUPABASE_SERVICE_ROLE_KEY','WHATSAPP_ACCESS_TOKEN','TELEGRAM_BOT_TOKEN','GOOGLE_CALENDAR_CLIENT_ID','MICROSOFT_CALENDAR_CLIENT_ID','SETMORE_ACCESS_TOKEN']) if(!env.includes(key+'=')) throw new Error(`Missing env template key: ${key}`);
const secretPatterns=[/sk_live_[A-Za-z0-9]{16,}/,/whsec_[A-Za-z0-9]{16,}/,/sb_secret_[A-Za-z0-9]{16,}/];
const scanFiles=['.env.example','README.md','GITHUB_DEPLOY.md','app/components/SetApp.js'];
for(const f of scanFiles){ const txt=fs.readFileSync(path.join(root,f),'utf8'); for(const re of secretPatterns) if(re.test(txt)) throw new Error(`Possible live secret in ${f}`); }
console.log('Final static release checks passed.');

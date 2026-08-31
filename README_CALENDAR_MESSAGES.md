# SET v1.0.3 — Calendar + Mobile Messages

## Calendar
- Existing events open a full editor.
- Rename, reschedule, change event type, project, location, meeting link and notes.
- Add attendee/person name and email.
- Delete existing events.
- Project is shown inside event cards and links directly to its Workspace.
- Calendar event types remain visually categorized.
- Changes continue through the existing SET Cloud/Supabase core sync.

## Mobile Messages
- Rebuilt as a mobile master/detail flow.
- Conversation list and active chat no longer stack vertically on top of each other.
- Opening a conversation switches to the chat view.
- Back arrow returns to the conversation list.
- Composer, chat header, long names and bubbles adapt to narrow screens.
- Safe responsive handling at <=700px and compact handling at <=420px.

## Verification
- npm test: 62/62 passed.
- scripts-final-check.mjs: passed.

import { Resend } from 'resend';

let resend;
function client(){
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not configured');
  resend ||= new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendTransactionalEmail({to, subject, html, replyTo, attachments}) {
  if (!to) throw new Error('Recipient email is required');
  const from = process.env.SET_EMAIL_FROM || 'SET <billing@example.com>';
  return client().emails.send({ from, to, subject, html, replyTo, attachments });
}

// Supabase Edge Function: google-booking
// Deploy with: supabase functions deploy google-booking
// Purpose: Upload Room/Villa ID proof to Google Drive and create Google Calendar event with attachment.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

function base64Url(input: ArrayBuffer | string) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function pemToArrayBuffer(pem: string) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getGoogleToken(serviceAccount: any, subject?: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/calendar',
    aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
    ...(subject ? { sub: subject } : {}),
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claim))}`;
  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64Url(sig)}`;
  const res = await fetch(serviceAccount.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(out.error_description || out.error || 'Google token failed');
  return out.access_token as string;
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) throw new Error('Invalid ID proof image data. Expected data URL.');
  const mimeType = match[1] || 'image/jpeg';
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { mimeType, bytes };
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const p of parts) { out.set(p, offset); offset += p.length; }
  return out;
}

async function uploadToDrive(token: string, folderId: string, filename: string, dataUrl: string) {
  const { mimeType, bytes } = parseDataUrl(dataUrl);
  const boundary = `dineflow_${crypto.randomUUID()}`;
  const metadata = { name: filename, parents: folderId ? [folderId] : undefined };
  const enc = new TextEncoder();
  const body = concatBytes([
    enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    enc.encode(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`),
    bytes,
    enc.encode(`\r\n--${boundary}--`),
  ]);
  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,mimeType', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  const file = await res.json();
  if (!res.ok) throw new Error(file.error?.message || 'Drive upload failed');

  // Make file readable via link. If you do not want public links, remove this and keep domain/private permissions.
  await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}/permissions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'reader', type: 'anyone' }),
  });
  return file;
}

async function createCalendarEvent(token: string, calendarId: string, restaurant: any, booking: any, file: any) {
  const start = booking.dateTime ? new Date(booking.dateTime) : new Date();
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const event = {
    summary: `${restaurant.name || 'Restaurant'} Booking - ${booking.bookingCode || booking.id}`,
    description: `Booking ID: ${booking.bookingCode || booking.id}\nGuest: ${booking.name}\nPhone: ${booking.phone}\nPax: ${booking.pax}\nID Proof: ${file.webViewLink || ''}`,
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    attachments: file?.webViewLink ? [{ fileUrl: file.webViewLink, title: file.name, mimeType: file.mimeType }] : [],
  };
  const cid = encodeURIComponent(calendarId || 'primary');
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${cid}/events?supportsAttachments=true`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(out.error?.message || 'Calendar event failed');
  return out;
}


async function sendConfirmationEmail(token: string, sender: string, booking: any, restaurant: any, file: any, event: any) {
  if (!booking.email || !sender) return null;
  const subject = `Booking Confirmed - ${booking.bookingCode || booking.id}`;
  const body = `Hello ${booking.name},

Your booking is confirmed.

Booking ID: ${booking.bookingCode || booking.id}
Restaurant: ${restaurant.name}
Date/Time: ${booking.dateTime}
Phone: ${booking.phone}
ID Proof: ${file?.webViewLink || 'Not applicable'}
Calendar: ${event?.htmlLink || ''}

Thank you,
${restaurant.name}`;
  const raw = btoa(`From: ${sender}
To: ${booking.email}
Subject: ${subject}
Content-Type: text/plain; charset=utf-8

${body}`).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/${encodeURIComponent(sender)}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });
  const out = await res.json();
  if (!res.ok) throw new Error(out.error?.message || 'Gmail confirmation failed');
  return out;
}


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { restaurant, booking, idProofDataUrl, idProofName } = await req.json();
    if (!restaurant?.googleServiceAccountJson) throw new Error('Google Service Account JSON missing in Restaurant Settings.');
    if (!restaurant?.googleDriveFolderId) throw new Error('Google Drive Folder ID missing in Restaurant Settings.');
    if (!restaurant?.googleCalendarId) throw new Error('Google Calendar ID missing in Restaurant Settings.');
    if (!idProofDataUrl) throw new Error('ID proof image is required for Room/Villa booking.');

    const serviceAccount = typeof restaurant.googleServiceAccountJson === 'string'
      ? JSON.parse(restaurant.googleServiceAccountJson)
      : restaurant.googleServiceAccountJson;

    const token = await getGoogleToken(serviceAccount);
    const safeName = `${booking.bookingCode || booking.id || crypto.randomUUID()}-${idProofName || 'id-proof.jpg'}`.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const file = await uploadToDrive(token, restaurant.googleDriveFolderId, safeName, idProofDataUrl);
    const event = await createCalendarEvent(token, restaurant.googleCalendarId, restaurant, booking, file);
    let emailResult = null;
    let emailError = '';
    if (booking.email && restaurant.gmailSenderEmail) {
      try {
        const gmailToken = await getGoogleToken(serviceAccount, restaurant.gmailSenderEmail);
        emailResult = await sendConfirmationEmail(gmailToken, restaurant.gmailSenderEmail, booking, restaurant, file, event);
      } catch (e) { emailError = String(e?.message || e); }
    }

    return json({
      ok: true,
      idProofUrl: file.webViewLink,
      driveFileId: file.id,
      calendarEventId: event.id,
      calendarHtmlLink: event.htmlLink,
      emailSent: !!emailResult,
      emailError,
    });
  } catch (e) {
    console.error('DineFlow Edge Function Error:', e?.message || e);
    return json({ ok: false, error: String(e?.message || e) }, 400);
  }
});

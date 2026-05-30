const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
function base64Url(input: ArrayBuffer | string) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = ''; bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
function pemToArrayBuffer(pem: string) {
  const clean = pem.replace(/-----BEGIN PRIVATE KEY-----/g, '').replace(/-----END PRIVATE KEY-----/g, '').replace(/\s/g, '');
  const binary = atob(clean); const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
async function getToken(sa: any) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(JSON.stringify({ iss: sa.client_email, scope: 'https://www.googleapis.com/auth/firebase.messaging', aud: sa.token_uri || 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now }))}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64Url(sig)}`;
  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
  const out = await res.json(); if (!res.ok) throw new Error(out.error_description || out.error || 'FCM token failed');
  return out.access_token;
}
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const { restaurant, tokens, title, body, data } = await req.json();
    const rawBase64 = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_BASE64');
    const raw = rawBase64 ? atob(rawBase64) : (Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON') || restaurant?.googleServiceAccountJson);
    if (!raw) throw new Error('Firebase/Google service account JSON missing');
    let sa;
    try {
      sa = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      throw new Error('Firebase service account JSON is invalid. Please set FIREBASE_SERVICE_ACCOUNT_BASE64 from firebase-adminsdk.json.');
    }
    const projectId = restaurant?.firebaseProjectId || sa.project_id || 'dineflow-restaurant-4971-990f7';
    const accessToken = await getToken(sa);
    const results = [];
    for (const token of tokens || []) {
      const res = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { token, notification: { title, body }, data: Object.fromEntries(Object.entries(data || {}).map(([k, v]) => [k, String(v)])), webpush: { fcm_options: { link: data?.url || '/app' }, notification: { title, body, icon: '/icon-192.png', badge: '/icon-192.png', vibrate: [300, 120, 300] } } } }),
      });
      results.push({ token: String(token).slice(0, 16), ok: res.ok, response: await res.json().catch(() => ({})) });
    }
    return json({ ok: true, results });
  } catch (e) {
    console.error('send-push error:', e?.message || e);
    return json({ ok: false, error: String(e?.message || e) }, 400);
  }
});

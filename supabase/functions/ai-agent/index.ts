// Supabase Edge Function: ai-agent
// Deploy: supabase functions deploy ai-agent
// Calls Vertex AI Gemini with DineFlow context. Can be upgraded to Agent Builder/Conversational Agent endpoint.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

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
async function getGoogleToken(serviceAccount: any, scope = 'https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/gmail.send') {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${base64Url(JSON.stringify({ iss: serviceAccount.client_email, scope, aud: serviceAccount.token_uri || 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now }))}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToArrayBuffer(serviceAccount.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const jwt = `${unsigned}.${base64Url(sig)}`;
  const res = await fetch(serviceAccount.token_uri || 'https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
  const out = await res.json();
  if (!res.ok) throw new Error(out.error_description || out.error || 'Google token failed');
  return out.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  try {
    const { restaurant, message, guest, booking, recentOrders } = await req.json();
    if (!restaurant?.googleServiceAccountJson) throw new Error('Service Account JSON missing in AI Agent Settings.');
    const serviceAccount = typeof restaurant.googleServiceAccountJson === 'string' ? JSON.parse(restaurant.googleServiceAccountJson) : restaurant.googleServiceAccountJson;
    const projectId = restaurant.vertexProjectId || serviceAccount.project_id;
    const location = restaurant.vertexLocation || 'us-central1';
    const model = restaurant.vertexModel || 'gemini-1.5-flash-002';
    const token = await getGoogleToken(serviceAccount);
    const system = `You are DineFlow AI Agent for restaurant ${restaurant.name}. Be polite, short, helpful, and professional. Help guests with booking status, table/room/villa info, order status, complaints, and common restaurant questions. Never reveal private credentials. If unsure, ask staff to assist.`;
    const context = { guest, booking, recentOrders, restaurant: { name: restaurant.name, address: restaurant.address, phone: restaurant.phone } };
    const body = {
      contents: [{ role: 'user', parts: [{ text: `${system}\n\nContext JSON:\n${JSON.stringify(context)}\n\nGuest message: ${message}` }] }],
      generationConfig: { temperature: 0.35, maxOutputTokens: 500 },
    };
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
    const res = await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error?.message || 'Vertex AI request failed');
    const reply = out.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n') || 'Thank you. Our team will assist you shortly.';
    return json({ ok: true, reply });
  } catch (e) {
    console.error('DineFlow Edge Function Error:', e?.message || e);
    return json({ ok: false, error: String(e?.message || e), reply: 'Thank you for your message. Our team will assist you shortly.' }, 400);
  }
});

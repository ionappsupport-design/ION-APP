import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

// ─── Plans (server-controlled, client cannot tamper) ─────────────────────────
const PLANS = {
  monthly:  { price: 15,  currency: 'INR', name: 'Monthly Pro'  },
  annual:   { price: 99,  currency: 'INR', name: 'Annual Pro'   },
  lifetime: { price: 150, currency: 'INR', name: 'Lifetime Pro' },
} as const;

// ─── Decode Firebase JWT (base64 only, no sig verify — relies on HTTPS) ──────
function decodeJWT(token: string): Record<string, any> | null {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch { return null; }
}

// ─── Generate Google OAuth2 access token from service account ─────────────────
async function getGoogleToken(sa: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const hdr = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const pld = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  })).toString('base64url');
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${hdr}.${pld}`);
  const sig = signer.sign(sa.private_key, 'base64url');
  const jwt = `${hdr}.${pld}.${sig}`;

  const r = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const d = await r.json() as any;
  if (!d.access_token) throw new Error(`Google token error: ${JSON.stringify(d)}`);
  return d.access_token;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: { message: 'Method not allowed.' } });

  // 1. Decode Firebase JWT → get uid
  const authHeader = (req.headers.authorization ?? '');
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Missing or invalid Authorization header.' } });
  }
  const claims = decodeJWT(authHeader.split('Bearer ')[1]);
  if (!claims?.sub) return res.status(401).json({ error: { message: 'Invalid Firebase ID token.' } });
  const uid = claims.sub as string;

  // 2. Validate input
  const body: any = (req.body as any)?.data ?? req.body ?? {};
  const { planId, paymentId, orderId, signature } = body;
  if (!planId || !paymentId || !orderId || !signature) {
    return res.status(400).json({ error: { message: 'Missing required payment verification fields.' } });
  }
  const plan = PLANS[planId as keyof typeof PLANS];
  if (!plan) return res.status(400).json({ error: { message: `Invalid plan ID: ${planId}` } });

  // 3. Razorpay HMAC signature (primary security layer)
  const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? '';
  const KEY_ID     = process.env.RAZORPAY_KEY_ID     ?? '';
  const expected = crypto.createHmac('sha256', KEY_SECRET).update(`${orderId}|${paymentId}`).digest('hex');
  if (expected !== signature) {
    return res.status(403).json({ error: { message: 'Payment signature verification failed.' } });
  }

  // 4. Parse service account + get Google access token
  let sa: any, accessToken: string;
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON not set');
    sa = JSON.parse(raw);
    accessToken = await getGoogleToken(sa);
  } catch (e: any) {
    return res.status(500).json({ error: { message: `Config error: ${e.message}` } });
  }

  const projectId = sa.project_id;
  const BASE = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
  const headers = { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  // 5. Replay protection
  const orderUrl = `${BASE}/processed_orders/${encodeURIComponent(orderId)}`;
  const existing = await fetch(orderUrl, { headers });
  if (existing.status === 200) {
    return res.status(409).json({ error: { message: 'This order has already been processed.' } });
  }

  // 6. Razorpay API capture verification
  if (KEY_ID) {
    try {
      const { default: Razorpay } = await import('razorpay');
      const rzp     = new (Razorpay as any)({ key_id: KEY_ID, key_secret: KEY_SECRET });
      const payment = await rzp.payments.fetch(paymentId);
      if (payment.status !== 'captured') {
        return res.status(402).json({ error: { message: `Payment not captured. Status: ${payment.status}` } });
      }
      if (payment.amount / 100 !== plan.price || payment.currency !== plan.currency) {
        return res.status(402).json({ error: { message: 'Amount/currency mismatch.' } });
      }
    } catch (e: any) {
      return res.status(500).json({ error: { message: `Razorpay error: ${e?.message}` } });
    }
  }

  // 7. Write to Firestore via REST API (atomic via precondition)
  const now = Date.now();
  const expiresAt = planId === 'monthly' ? now + 30 * 24 * 60 * 60 * 1000
                  : planId === 'annual'  ? now + 365 * 24 * 60 * 60 * 1000
                  : null;

  const fsInt  = (v: number) => ({ integerValue: String(v) });
  const fsStr  = (v: string) => ({ stringValue: v });
  const fsBool = (v: boolean) => ({ booleanValue: v });

  // Write order (currentDocument.exists=false = atomic, prevents replay race)
  await fetch(`${orderUrl}?currentDocument.exists=false`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ fields: {
      uid: fsStr(uid), planId: fsStr(planId),
      paymentId: fsStr(paymentId), processedAt: fsInt(now),
    }}),
  });

  // Write user membership
  const memberFields: Record<string, any> = {
    isPro: fsBool(true), planId: fsStr(planId), planName: fsStr(plan.name),
    paymentId: fsStr(paymentId), orderId: fsStr(orderId), purchasedAt: fsInt(now),
    expiresAt: expiresAt ? fsInt(expiresAt) : { nullValue: null },
    amountPaid: fsInt(plan.price), currency: fsStr(plan.currency),
    status: fsStr('active'), isTrial: fsBool(false), trialDaysLeft: fsInt(0),
  };
  const fieldMask = Object.keys(memberFields).map(f => `updateMask.fieldPaths=${f}`).join('&');
  await fetch(`${BASE}/users/${uid}?${fieldMask}`, {
    method: 'PATCH', headers,
    body: JSON.stringify({ fields: memberFields }),
  });

  return res.status(200).json({ result: { success: true, isPro: true, planId, expiresAt } });
}

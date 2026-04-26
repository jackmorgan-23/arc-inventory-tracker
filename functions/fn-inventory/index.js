import * as ff from '@google-cloud/functions-framework';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'node:crypto';

admin.initializeApp();
const FIRESTORE_DATABASE = process.env.FIRESTORE_DATABASE || 'arc-raiders-database';
const db = getFirestore(undefined, FIRESTORE_DATABASE);
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

const DEFAULT_CLIENT_ID = '610891863720-762ompnl3j4m0futovafbn0keapech1k.apps.googleusercontent.com';
const configuredAudiences = (process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID || DEFAULT_CLIENT_ID)
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);
const primaryClientId = configuredAudiences[0];
const client = new OAuth2Client(primaryClientId);

function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

function getAllowedOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return null;

  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]);

  if (origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
    return origin;
  }

  if (allowedOrigins.has(origin)) {
    return origin;
  }

  return null;
}

function applyCors(req, res) {
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) {
    res.set('Access-Control-Allow-Origin', allowedOrigin);
    res.set('Access-Control-Allow-Credentials', 'true');
    res.set('Vary', 'Origin');
  }
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return cookies;
      const key = decodeURIComponent(part.slice(0, separatorIndex));
      const value = decodeURIComponent(part.slice(separatorIndex + 1));
      cookies[key] = value;
      return cookies;
    }, {});
}

function buildSessionCookie(sessionId, req) {
  const isSecure = (req.get('x-forwarded-proto') || req.protocol) === 'https';
  const sameSite = isSecure ? 'None' : 'Lax';
  const parts = [
    `session=${encodeURIComponent(sessionId)}`,
    'HttpOnly',
    `SameSite=${sameSite}`,
    'Path=/',
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];

  if (isSecure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function buildExpiredSessionCookie(req) {
  const isSecure = (req.get('x-forwarded-proto') || req.protocol) === 'https';
  const sameSite = isSecure ? 'None' : 'Lax';
  const parts = [
    'session=',
    'HttpOnly',
    `SameSite=${sameSite}`,
    'Path=/',
    'Max-Age=0',
  ];

  if (isSecure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

async function createSession({ uid, email }) {
  const sessionId = crypto.randomUUID();
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.collection('sessions').doc(sessionId).set({
    uid,
    email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt,
  });

  return sessionId;
}

async function getUidFromSession(req) {
  const sessionId = req.get('x-session-id') || parseCookies(req.get('cookie') || '').session;
  if (!sessionId) return null;

  const sessionDoc = await db.collection('sessions').doc(sessionId).get();
  if (!sessionDoc.exists) return null;

  const session = sessionDoc.data();
  const expiresAtMillis = session?.expiresAt?.toMillis?.();
  if (!session?.uid || !expiresAtMillis || expiresAtMillis <= Date.now()) {
    await db.collection('sessions').doc(sessionId).delete().catch(() => {});
    return null;
  }

  return {
    uid: session.uid,
    sessionId,
  };
}

ff.http('fnInventory', async (req, res) => {
  // CORS configuration
  applyCors(req, res);
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Id');
    res.set('Access-Control-Max-Age', '3600');
    return res.status(204).send('');
  }

  // Handle /verifyToken route (OIDC Lab style)
  if (req.path === '/verifyToken' && req.method === 'POST') {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ error: 'idToken is required' });
      }

      const ticket = await client.verifyIdToken({
        idToken,
        audience: configuredAudiences,
      });
      const payload = ticket.getPayload();
      const uid = payload['sub'];
      const email = payload['email'];
      const sessionId = await createSession({ uid, email });
      res.set('Set-Cookie', buildSessionCookie(sessionId, req));

      let persistenceWarning = null;

      try {
        await db.collection('users').doc(uid).set({
          email,
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } catch (firestoreError) {
        persistenceWarning = 'User profile could not be written to Firestore.';
        console.error('Firestore user upsert failed after valid token verification', {
          message: firestoreError.message,
          code: firestoreError.code,
          details: firestoreError.details,
        });
      }

      return res.status(200).json({
        message: 'Session verified',
        uid,
        email,
        sessionId,
        persistenceWarning,
      });
    } catch (e) {
      const rawPayload = decodeJwtPayload(req.body?.idToken || '');
      console.error('Token verification failed', {
        message: e.message,
        configuredAudiences,
        tokenAud: rawPayload?.aud,
        tokenIss: rawPayload?.iss,
        tokenAzp: rawPayload?.azp,
        tokenEmail: rawPayload?.email,
      });
      return res.status(401).json({
        error: 'Invalid token',
        details: 'Token audience or issuer did not match the backend configuration.',
      });
    }
  }

  if (req.path === '/logout' && req.method === 'POST') {
    try {
      const sessionId = req.get('x-session-id') || parseCookies(req.get('cookie') || '').session;
      if (sessionId) {
        await db.collection('sessions').doc(sessionId).delete().catch(() => {});
      }
      res.set('Set-Cookie', buildExpiredSessionCookie(req));
      return res.status(200).json({ message: 'Logged out' });
    } catch (error) {
      console.error('Logout failed', error);
      res.set('Set-Cookie', buildExpiredSessionCookie(req));
      return res.status(200).json({ message: 'Logged out' });
    }
  }

  // Extract user info
  let uid = null;
  const sessionAuth = await getUidFromSession(req);
  if (sessionAuth?.uid) {
    uid = sessionAuth.uid;
  } else if (req.get('authorization') && req.get('authorization').startsWith('Bearer ')) {
    // Fallback for direct testing or local dev
    const token = req.get('authorization').split('Bearer ')[1];
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: configuredAudiences,
      });
      uid = ticket.getPayload()['sub'];
    } catch (e) {
      console.error('Failed to verify token with Google', e);
    }
  } else {
    const userInfoHeader = req.get('x-apigateway-api-userinfo');
    if (userInfoHeader) {
      try {
        const userInfo = JSON.parse(Buffer.from(userInfoHeader, 'base64').toString('utf-8'));
        uid = userInfo.user_id || userInfo.sub;
      } catch (e) {
        console.error('Failed to parse API Gateway user info', e);
      }
    }
  }

  if (!uid) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Parse path: /loadouts/{index}
  // If the path is something like /loadouts/0 or /0
  const pathParts = req.path.split('/').filter(Boolean);
  let loadoutIndex = undefined;

  // API Gateway might strip the prefix, so we check what's there
  if (pathParts.length > 0) {
    if (pathParts[0] === 'loadouts') {
      loadoutIndex = pathParts[1];
    } else {
      loadoutIndex = pathParts[0];
    }
  }

  try {
    const userRef = db.collection('users').doc(uid);
    const loadoutsRef = userRef.collection('loadouts');

    if (req.method === 'GET') {
      if (loadoutIndex !== undefined) {
        // Get specific loadout
        const doc = await loadoutsRef.doc(loadoutIndex).get();
        if (!doc.exists) {
          return res.status(200).json({});
        }
        return res.status(200).json(doc.data());
      } else {
        // Get all loadouts
        const snapshot = await loadoutsRef.get();
        const loadouts = {};
        snapshot.forEach(doc => {
          loadouts[doc.id] = doc.data();
        });
        return res.status(200).json(loadouts);
      }
    } else if (req.method === 'POST') {
      if (loadoutIndex === undefined) {
        return res.status(400).json({ error: 'Loadout index required for POST' });
      }
      const data = req.body;
      if (!data) {
        return res.status(400).json({ error: 'Missing request body' });
      }
      await loadoutsRef.doc(loadoutIndex).set(data);
      return res.status(200).json({ message: 'Loadout saved successfully' });
    } else if (req.method === 'DELETE') {
      if (loadoutIndex === undefined) {
        return res.status(400).json({ error: 'Loadout index required for DELETE' });
      }
      await loadoutsRef.doc(loadoutIndex).delete();
      return res.status(200).json({ message: 'Loadout deleted successfully' });
    } else {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error('Firestore operation failed:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

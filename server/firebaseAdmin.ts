import * as firebaseAdminModule from 'firebase-admin';
import firebaseConfig from '../firebase-applet-config.json' assert { type: 'json' };

// Normalize CJS / ESM default export between tsx development and bundled production
export const admin: typeof import('firebase-admin') =
  (firebaseAdminModule as any).default || firebaseAdminModule;

let adminApp: any = null;

export function getFirebaseAdmin() {
  if (adminApp) {
    return adminApp;
  }

  // Reuse existing app if already initialized
  if (admin.apps && admin.apps.length > 0) {
    adminApp = admin.apps[0];
    return adminApp;
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      if (
        serviceAccount &&
        typeof serviceAccount === 'object' &&
        (serviceAccount.client_email || serviceAccount.private_key)
      ) {
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: firebaseConfig.projectId
        });
        console.log('[Firebase Admin] Initialized successfully with service account credentials.');
        return adminApp;
      } else {
        console.warn(
          '[Firebase Admin] FIREBASE_SERVICE_ACCOUNT_KEY is not a valid service account JSON object. Initializing with project ID:',
          firebaseConfig.projectId
        );
      }
    } catch (err: any) {
      console.warn(
        '[Firebase Admin] Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON. Initializing with project ID:',
        err?.message
      );
    }
  }

  try {
    adminApp = admin.initializeApp({
      projectId: firebaseConfig.projectId
    });
    console.log('[Firebase Admin] Initialized successfully with project ID:', firebaseConfig.projectId);
    return adminApp;
  } catch (err: any) {
    console.error('[Firebase Admin] Failed to initialize Firebase Admin SDK:', err);
    return null;
  }
}

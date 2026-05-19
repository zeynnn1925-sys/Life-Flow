import express from 'express';
import { createServer as createViteServer } from 'vite';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

// Lazy initialization of Firebase Admin
let adminApp: admin.app.App | null = null;

function getFirebaseAdmin() {
  if (!adminApp) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountKey) {
      console.warn('FIREBASE_SERVICE_ACCOUNT_KEY is not set. Firebase Admin SDK will not be initialized.');
      return null;
    }
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      return null;
    }
  }
  return adminApp;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Middleware
  const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const firebaseAdmin = getFirebaseAdmin();
    
    if (!firebaseAdmin) {
      // In development, if Firebase key is missing, we might want to bypass or show clear error
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Firebase Admin not initialized, skipping authentication check');
        (req as any).user = { uid: 'dev-user', email: 'dev@example.com' };
        return next();
      }
      return res.status(500).json({ error: 'Server authentication service unavailable' });
    }

    try {
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Error verifying auth token:', error);
      res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', adminInitialized: !!getFirebaseAdmin() });
  });

  // Protected Admin Route: Get total users count from Firestore
  app.get('/api/admin/users/count', authenticate, async (req, res) => {
    const firebaseAdmin = getFirebaseAdmin();
    if (!firebaseAdmin) {
      return res.status(500).json({ error: 'Firebase Admin not configured.' });
    }
    try {
      const db = firebaseAdmin.firestore();
      const snapshot = await db.collection('users').count().get();
      res.json({ count: snapshot.data().count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

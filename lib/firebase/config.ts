import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const EXPECTED_FIREBASE_PROJECT_ID = 'codex-martis-dev';
const EXPECTED_FIREBASE_AUTH_DOMAIN = 'codex-martis-dev.firebaseapp.com';
const EXPECTED_FIREBASE_MESSAGING_SENDER_ID = '298157879508';
const EXPECTED_FIREBASE_APP_ID = '1:298157879508:web:011e820fdcb1d9fb3acb41';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

const matchesExpectedFirebaseApp =
  firebaseConfig.projectId === EXPECTED_FIREBASE_PROJECT_ID &&
  firebaseConfig.authDomain === EXPECTED_FIREBASE_AUTH_DOMAIN &&
  firebaseConfig.messagingSenderId === EXPECTED_FIREBASE_MESSAGING_SENDER_ID &&
  firebaseConfig.appId === EXPECTED_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    matchesExpectedFirebaseApp
);

if (firebaseConfig.projectId && !matchesExpectedFirebaseApp) {
  console.error(
    'Firebase configuration rejected: the environment variables do not match the Codex Martis dev Web App.'
  );
}

export const app: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'demo-api-key-placeholder',
            authDomain: 'codex-martis-demo.firebaseapp.com',
            projectId: 'codex-martis-demo',
            appId: '1:123456789:web:abcdef',
          }
    );

// Codex Martis uses the default Firestore database of codex-martis-dev.
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

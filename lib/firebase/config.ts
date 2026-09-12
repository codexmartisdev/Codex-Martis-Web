import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const EXPECTED_FIREBASE_PROJECT_ID = 'codex-martis-dev';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId &&
    firebaseConfig.projectId === EXPECTED_FIREBASE_PROJECT_ID
);

if (firebaseConfig.projectId && firebaseConfig.projectId !== EXPECTED_FIREBASE_PROJECT_ID) {
  console.error(
    `Firebase configuration rejected: expected projectId "${EXPECTED_FIREBASE_PROJECT_ID}", received "${firebaseConfig.projectId}".`
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

export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

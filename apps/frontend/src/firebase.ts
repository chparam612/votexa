import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const {
  EXPO_PUBLIC_FIREBASE_API_KEY: apiKey,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: authDomain,
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: projectId,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: storageBucket,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: messagingSenderId,
  EXPO_PUBLIC_FIREBASE_APP_ID: appId,
} = process.env;

const missingVars = [
  ['EXPO_PUBLIC_FIREBASE_API_KEY', apiKey],
  ['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN', authDomain],
  ['EXPO_PUBLIC_FIREBASE_PROJECT_ID', projectId],
  ['EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET', storageBucket],
  ['EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', messagingSenderId],
  ['EXPO_PUBLIC_FIREBASE_APP_ID', appId],
]
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}. ` +
      'Copy apps/frontend/.env.local.example to apps/frontend/.env.local and fill in your credentials.',
  );
}

const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };

const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;

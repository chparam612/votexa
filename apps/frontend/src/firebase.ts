import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyB5HT_NPp0x_JQ5HwAEEc0Lz9cAXNoZF28",
  authDomain: "votexa-ac15c.firebaseapp.com",
  projectId: "votexa-ac15c",
  storageBucket: "votexa-ac15c.firebasestorage.app",
  messagingSenderId: "419650757228",
  appId: "1:419650757228:web:39b3d29c418fe680482e49"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;

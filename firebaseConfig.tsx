import { initializeApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { initializeAuth, getAuth, getReactNativePersistence } from "firebase/auth";
import "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MESSAGING_SENDER_ID,
  APP_ID
} from '@env';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  databaseURL: DATABASE_URL,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
//   measurementId: 'G-measurement-id',
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_DB = initializeFirestore(FIREBASE_APP, { experimentalForceLongPolling: true });
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// let app and db be visable to all files that import firebaseConfig.js
export { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH };

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

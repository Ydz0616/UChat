import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
import {getAuth} from "firebase/auth";
import "firebase/firestore";
// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyASwEvJkTS1rIiYuxhys5QNoBUFoxPRcXU',
  authDomain: 'icebreaker-16bc6.firebaseapp.com',
  databaseURL: 'https://icebreaker-16bc6.firebaseio.com',
  projectId: 'icebreaker-16bc6',
  storageBucket: 'icebreaker-16bc6.appspot.com',
  messagingSenderId: '603545245121',
  appId: '381750a6a409b80f630b40',
//   measurementId: 'G-measurement-id',
};

const FIREBASE_APP = initializeApp(firebaseConfig);
const FIREBASE_DB= getFirestore(FIREBASE_APP);
const FIREBASE_AUTH = getAuth(FIREBASE_APP);

// let app and db be visable to all files that import firebaseConfig.js
export { FIREBASE_APP, FIREBASE_DB, FIREBASE_AUTH };

// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase

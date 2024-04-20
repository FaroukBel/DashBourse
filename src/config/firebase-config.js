// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Timestamp } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDXA2_B1T-sloVc8_GVe0e9eZZrn7xh0zA',
  authDomain: 'dashbourse.firebaseapp.com',
  projectId: 'dashbourse',
  storageBucket: 'dashbourse.appspot.com',
  messagingSenderId: '321623887500',
  appId: '1:321623887500:web:cd06aa117fce16b7ef35a9',
  measurementId: 'G-SWBNX4LXHN',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore(app);
export { Timestamp };

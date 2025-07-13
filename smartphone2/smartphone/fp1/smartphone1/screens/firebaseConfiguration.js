import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB-YCvqRHz3fZmF81B19Tr8gfFNPrjJH9w",
    authDomain: "final-94fec.firebaseapp.com",
    databaseURL: "https://final-94fec-default-rtdb.firebaseio.com",
    projectId: "final-94fec",
    storageBucket: "final-94fec.appspot.com",
    messagingSenderId: "879775795481",
    appId: "1:879775795481:web:829a03ce72015b5c595d88"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// Export Firebase services
export { app, auth, database, storage };

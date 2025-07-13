// Import Firebase libraries
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';  // Import Firestore

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

// Check if Firebase app is already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const firestore = getFirestore(app);  // Initialize Firestore

// Function to upload a file to Firebase Storage
const uploadFile = async (file, folderName = 'uploads') => {
    try {
        // Create a storage reference
        const storageRef = ref(storage, `${folderName}/${file.name}`);

        // Convert the file to a Blob (if required)
        const fileBlob = await fetch(file.uri).then((res) => res.blob());

        // Upload the file
        const snapshot = await uploadBytes(storageRef, fileBlob);

        // Get the file's download URL
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('File uploaded successfully:', downloadURL);
        return downloadURL; // Return the file URL for further use
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// Export the auth, database, storage, uploadFile function, and firestore
export { auth, database, storage, uploadFile, firestore };

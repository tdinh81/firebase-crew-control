
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDAkxaHf-9V8drmx1c4FvDDxh-l6MOGtc4",
  authDomain: "crew-control-app.firebaseapp.com",
  projectId: "crew-control-app",
  storageBucket: "crew-control-app.appspot.com",
  messagingSenderId: "275650241754",
  appId: "1:275650241754:web:a9a3df72fe9c1a2f5fb93b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

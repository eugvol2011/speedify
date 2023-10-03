import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyCchMMexH62R64kOUbtcnc4i1_cJzkHVIw",
  authDomain: "speedify-67fc3.firebaseapp.com",
  projectId: "speedify-67fc3",
  storageBucket: "speedify-67fc3.appspot.com",
  messagingSenderId: "644432632343",
  appId: "1:644432632343:web:d957d335848c65813b9a52",
  measurementId: "G-71CFBYQ90J"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const db = getFirestore(app)
const auth = getAuth(app)

export { app, db, auth }

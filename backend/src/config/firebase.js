const admin = require('firebase-admin');

// Parse the service account JSON from the environment variable
let serviceAccount;
let firebaseInitialized = false;

try {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT.trim() === '') {
    console.warn('⚠️  WARNING: FIREBASE_SERVICE_ACCOUNT is not set. Authentication will not work.');
    console.warn('   Set FIREBASE_SERVICE_ACCOUNT in backend/.env to enable auth.');
  } else {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error.message);
  console.warn('⚠️  Server will start without Firebase. Authentication routes will be unavailable.');
}

module.exports = { admin, firebaseInitialized };

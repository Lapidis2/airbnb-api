import admin from "firebase-admin";

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

    if (!serviceAccount) {
      console.warn("[FIREBASE] Service account not configured. Push notifications disabled.");
      return null;
    }

    const serviceAccountJson = JSON.parse(serviceAccount);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
    });

    console.log("[FIREBASE] Firebase Admin initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("[FIREBASE] Failed to initialize Firebase Admin:", error);
    return null;
  }
};

export const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};

export default admin;

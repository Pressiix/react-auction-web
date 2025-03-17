const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_REALTIME_DB_URL,
};

const allowEmailDomain = [
  '@gmail.com',
  "@treg.co.th",
  "@dtgo.com",
  "@translucia.com",
  "@shellhutentertainment.com",
  "@tandbmediaglobal.com",
  "@vucadigital.co",
  "@rabbitmoon.co.th",
];
const allowEmails = ["tan.j007@gmail.com"];

export { firebaseConfig, allowEmailDomain, allowEmails };

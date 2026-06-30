import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Note: To receive notifications in browser/web client, you must configure a Firebase Web App.
// If config is not supplied, it will fallback to console warnings without crashing.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

let messaging = null;

try {
  const app = initializeApp(firebaseConfig);
  // messaging requires browser environment support (supported in HTTPS or localhost)
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase initialization failed (likely missing config):', error);
}

export const requestForToken = async (registerEndpoint) => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY // Make sure this is added to .env if needed
      });
      if (currentToken) {
        console.log('FCM token obtained:', currentToken);
        // Register token with backend API if needed
        const tokenVal = localStorage.getItem('token'); // Use standard token for user side
        const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        if (registerEndpoint) {
          await fetch(`${backendUrl}${registerEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(tokenVal ? { 'Authorization': `Bearer ${tokenVal}` } : {})
            },
            body: JSON.stringify({ token: currentToken }),
          });
        }
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Permission not granted for notifications.');
    }
  } catch (err) {
    console.warn('An error occurred while retrieving token:', err);
  }
  return null;
};

export const onMessageListener = (callback) => {
  if (!messaging) return () => {};
  return onMessage(messaging, (payload) => {
    callback(payload);
  });
};

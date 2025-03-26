import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js';
import { getMessaging, onBackgroundMessage } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-sw.js';

const firebaseApp = initializeApp({
  apiKey: 'AIzaSyCKAJptxgeraB0OvlX5dq5g4Bw18M0g-SU',
  authDomain: 'erizo-3e72a.firebaseapp.com',
  projectId: 'erizo-3e72a',
  storageBucket: 'erizo-3e72a.firebasestorage.app',
  messagingSenderId: '1074541584385',
  appId: '1:1074541584385:web:fe2c9505356e139e332000',
});

const messaging = getMessaging(firebaseApp);


// Open or create the IndexedDB database
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notificationsDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications')) {
        db.createObjectStore('notifications', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

const storeNotification = async (payload) => {
  try {
    const db = await openDatabase();
    const transaction = db.transaction('notifications', 'readwrite');
    const store = transaction.objectStore('notifications');

    store.add(payload);
    transaction.oncomplete = () => console.log('Notification added to IndexedDB');
    transaction.onerror = (e) => console.error('Error storing notification:', e);
  } catch (error) {
    console.error('IndexedDB error:', error);
  }
};

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // Customize notification
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon512_maskable.png',
  };

  // Store notification payload in IndexedDB
  storeNotification(payload);

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});

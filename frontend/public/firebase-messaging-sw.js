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
      if (!db.objectStoreNames.contains('notification-page')) {
        db.createObjectStore('notification-page', { keyPath: 'id', autoIncrement: true });
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

/**
 *   NEW_POST = 'NEW_POST',
 *   DEVICE_ADDED = 'DEVICE_ADDED',
 *   CONNECTION_ADDED = 'CONNECTION_ADDED',
 *   CONNECTION_REQUEST = 'CONNECTION_REQUEST',
 */


function handleNewPostNotification(payload) {
  if (payload.data['type'] !== 'NEW_POST') return;

  self.registration.showNotification(
    'You got Mail',
    {
      body: 'Someone sent something for you, want to take a look?',
      icon: '/icon512_maskable.png',
    },
  );
}
function handleLikedPostNotification(payload) {
  if (payload.data['type'] !== 'LIKE_POST') return;

  self.registration.showNotification(
    'Someone likes what you are doing',
    {
      body: 'Someone liked your post. Want to see who and what?',
      icon: '/icon512_maskable.png',
    },
  );
}

function handleConnectionAddedNotification(payload) {
  if (payload.data['type'] !== 'CONNECTION_ADDED') return;

  self.registration.showNotification(
    'Your new new connection is there now',
    {
      body: 'Someone just accepted your connection request!',
      icon: '/icon512_maskable.png',
    },
  );
}

function handleConnectionRequestNotification(payload) {
  if (payload.data['type'] !== 'CONNECTION_REQUEST') return;

  self.registration.showNotification(
    'You have a new connection request',
    {
      body: 'Someone likes you! Do you want to connect?',
      icon: '/icon512_maskable.png',
    },
  );
}

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  handleNewPostNotification(payload);
  handleConnectionAddedNotification(payload);
  handleConnectionRequestNotification(payload);
  handleLikedPostNotification(payload);
  storeNotification(payload);

});

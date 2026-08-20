// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js')

// Nhận config từ URL query params
const urlParams = new URLSearchParams(location.search)

const firebaseConfig = {
  apiKey: urlParams.get('apiKey'),
  authDomain: urlParams.get('authDomain'),
  projectId: urlParams.get('projectId'),
  storageBucket: urlParams.get('storageBucket'),
  messagingSenderId: urlParams.get('messagingSenderId'),
  appId: urlParams.get('appId')
}

// Khởi tạo Firebase App nếu có đủ config
if (firebaseConfig.apiKey) {
  firebase.initializeApp(firebaseConfig)
  const messaging = firebase.messaging()

  messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)
    const notificationTitle = payload.notification?.title || 'Notification'
    const notificationOptions = {
      body: payload.notification?.body || '',
      icon: '/favicon.ico' // Thay bằng đường dẫn icon của app
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
  })
}

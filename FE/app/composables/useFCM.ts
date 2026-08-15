import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import type { PushNotificationSchema, Token } from '@capacitor/push-notifications'
import { getApp, getApps, initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { deviceTokenService } from '~/services/deviceTokenService'

export function useFCM() {
  const toast = useToast()
  const config = useRuntimeConfig()

  const initFCM = async () => {
    if (!import.meta.client) return

    // 1. Nếu chạy trên Capacitor Native App
    if (Capacitor.isNativePlatform()) {
      const permStatus = await PushNotifications.checkPermissions()
      if (permStatus.receive === 'prompt') {
        await PushNotifications.requestPermissions()
      }

      if (permStatus.receive !== 'granted') {
        return // Dừng nếu user từ chối
      }

      await PushNotifications.register()

      // Lắng nghe khi có Token mới
      PushNotifications.addListener('registration', async (token: Token) => {
        await submitTokenToBackend(token.value)
      })

      // Lỗi khi đăng ký
      PushNotifications.addListener('registrationError', () => {
        // ignore
      })

      // Nhận thông báo khi App đang mở (Foreground)
      PushNotifications.addListener(
        'pushNotificationReceived',
        (notification: PushNotificationSchema) => {
          toast.add({
            title: notification.title || 'Thông báo mới',
            description: notification.body || '',
            color: 'primary',
            icon: 'i-lucide-bell'
          })
        }
      )

      // User click vào thông báo
      PushNotifications.addListener('pushNotificationActionPerformed', () => {
        // Có thể redirect user đến màn hình /driver/notifications
      })

      return
    }

    // 2. Nếu chạy trên Web (PWA)
    if (
      !config.public.firebaseApiKey ||
      !('Notification' in window) ||
      !('serviceWorker' in navigator)
    ) {
      return
    }

    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey as string,
      authDomain: config.public.firebaseAuthDomain as string,
      projectId: config.public.firebaseProjectId as string,
      storageBucket: config.public.firebaseStorageBucket as string,
      messagingSenderId: config.public.firebaseMessagingSenderId as string,
      appId: config.public.firebaseAppId as string
    }

    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
      const messaging = getMessaging(app)

      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        const vapidKey = config.public.firebaseVapidKey as string
        if (!vapidKey) return

        // Register service worker manually with query params so it can use config
        const swUrl = `/firebase-messaging-sw.js?apiKey=${firebaseConfig.apiKey}&authDomain=${firebaseConfig.authDomain}&projectId=${firebaseConfig.projectId}&storageBucket=${firebaseConfig.storageBucket}&messagingSenderId=${firebaseConfig.messagingSenderId}&appId=${firebaseConfig.appId}`

        const registration = await navigator.serviceWorker.register(swUrl)

        const currentToken = await getToken(messaging, {
          vapidKey,
          serviceWorkerRegistration: registration
        })

        if (currentToken) {
          await submitTokenToBackend(currentToken)
        }

        // Nhận thông báo khi web đang mở
        onMessage(messaging, (payload) => {
          toast.add({
            title: payload.notification?.title || 'Thông báo mới',
            description: payload.notification?.body || '',
            color: 'primary',
            icon: 'i-lucide-bell'
          })
        })
      }
    } catch {
      // ignore
    }
  }

  const submitTokenToBackend = async (deviceToken: string) => {
    try {
      await deviceTokenService.submitToken(
        deviceToken,
        Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web'
      )
    } catch {
      // ignore
    }
  }

  return {
    initFCM
  }
}

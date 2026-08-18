import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.buntech.app',
  appName: 'BunTech',
  webDir: '.output/public',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
}

export default config

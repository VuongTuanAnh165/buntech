import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.tamhung.app',
  appName: 'Xưởng bún Tâm Hùng',
  webDir: '.output/public',
  server: {
    androidScheme: 'http',
    cleartext: true
  }
}

export default config

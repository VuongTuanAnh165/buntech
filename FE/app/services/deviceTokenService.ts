import { ApiClient } from '~/utils/api'

export const deviceTokenService = {
  submitToken(deviceToken: string, deviceType: string) {
    return ApiClient.post('/driver/device-tokens', { deviceToken, deviceType })
  }
}

import DeviceToken from '#models/device_token'

export default class DeviceTokenService {
  /**
   * Register or update a device token for a user
   */
  async registerToken(
    userId: number,
    data: {
      fcmToken: string
      deviceType: string
    }
  ) {
    // Check if the token already exists in the system
    let deviceToken = await DeviceToken.query().where('fcm_token', data.fcmToken).first()

    if (deviceToken) {
      // If token exists but belongs to a different user, update it
      // This happens when multiple users log in on the same device
      deviceToken.userId = userId
      deviceToken.deviceType = data.deviceType
    } else {
      // Create new token mapping
      deviceToken = new DeviceToken()
      deviceToken.userId = userId
      deviceToken.fcmToken = data.fcmToken
      deviceToken.deviceType = data.deviceType
    }

    await deviceToken.save()
    return deviceToken
  }
}

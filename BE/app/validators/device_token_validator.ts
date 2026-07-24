import vine from '@vinejs/vine'

export const deviceTokenValidator = vine.compile(
  vine.object({
    fcmToken: vine.string().trim().maxLength(255),
    deviceType: vine.string().trim().maxLength(50), // e.g. ANDROID, IOS
  })
)

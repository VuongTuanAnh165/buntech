import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import relativeTime from 'dayjs/plugin/relativeTime'

/**
 * Plugin khởi tạo dayjs toàn cục.
 * - Locale: Tiếng Việt
 * - Plugin: relativeTime (VD: "2 giờ trước")
 *
 * Sử dụng trong component:
 *   const { $dayjs } = useNuxtApp()
 *   $dayjs().format('DD/MM/YYYY')
 *
 * Hoặc import trực tiếp trong utils:
 *   import dayjs from 'dayjs'
 */
export default defineNuxtPlugin(() => {
  dayjs.extend(relativeTime)
  dayjs.locale('vi')

  return {
    provide: {
      dayjs
    }
  }
})

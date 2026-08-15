import { driverService, type DeliverOrderPayload } from '~/services/driverService'
import { useOfflineSync } from './useOfflineSync'

export const useDriverDeliver = () => {
  const isSubmitting = ref(false)
  const toast = useToast()
  const { addToQueue } = useOfflineSync()

  const deliverOrder = async (orderId: number | string, payload: DeliverOrderPayload) => {
    isSubmitting.value = true
    try {
      if (!navigator.onLine) {
        await addToQueue({
          type: 'DELIVER_ORDER',
          orderId,
          payload
        })
        toast.add({
          title: 'Đã lưu offline',
          description: 'Mất kết nối mạng. Lệnh đã được đưa vào hàng đợi đồng bộ.',
          color: 'warning',
          icon: 'i-lucide-wifi-off'
        })
        return true // Optimistic success
      }

      const response = await driverService.deliverOrder(orderId, payload)
      return !!response.success
    } catch (error) {
      const err = error as Error
      if (err.message === 'Network Error' || err.name === 'TypeError') {
        // Fallback for network error when navigator.onLine is true but fetch fails
        await addToQueue({
          type: 'DELIVER_ORDER',
          orderId,
          payload
        })
        toast.add({
          title: 'Lỗi mạng',
          description: 'Không thể kết nối máy chủ. Lệnh đã được lưu vào hàng đợi.',
          color: 'warning',
          icon: 'i-lucide-wifi-off'
        })
        return true
      }
      return false
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    deliverOrder,
    isSubmitting
  }
}

import { driverService, type DeliverOrderPayload } from '~/services/driverService'

export const useDriverDeliver = () => {
  const isSubmitting = ref(false)

  const deliverOrder = async (orderId: number | string, payload: DeliverOrderPayload) => {
    isSubmitting.value = true
    try {
      const response = await driverService.deliverOrder(orderId, payload)
      return !!response.success
    } catch {
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

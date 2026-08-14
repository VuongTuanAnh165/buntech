import {
  adminOrderService,
  type UpdateOrderStatusPayload,
  type BatchAssignDriverPayload
} from '~/services/adminOrderService'

export function useAdminOrders() {
  const fetchOrders = async (params?: Record<string, unknown>) => {
    return await adminOrderService.fetchOrders(params)
  }

  const getOrder = async (id: string | number) => {
    return await adminOrderService.getOrder(id)
  }

  const updateStatus = async (id: string | number, payload: UpdateOrderStatusPayload) => {
    return await adminOrderService.updateStatus(id, payload)
  }

  const batchAssignDriver = async (payload: BatchAssignDriverPayload) => {
    return await adminOrderService.batchAssignDriver(payload)
  }

  return {
    fetchOrders,
    getOrder,
    updateStatus,
    batchAssignDriver
  }
}

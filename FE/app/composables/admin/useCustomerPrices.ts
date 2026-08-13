import {
  customerPriceService,
  type UpsertCustomPricePayload
} from '~/services/customerPriceService'

export function useCustomerPrices() {
  const fetchPrices = async (userId: string | number, params?: Record<string, unknown>) => {
    return await customerPriceService.fetchPrices(userId, params)
  }

  const upsertPrice = async (userId: string | number, payload: UpsertCustomPricePayload) => {
    return await customerPriceService.upsertPrice(userId, payload)
  }

  const deletePrice = async (userId: string | number, productId: string | number) => {
    return await customerPriceService.deletePrice(userId, productId)
  }

  return {
    fetchPrices,
    upsertPrice,
    deletePrice
  }
}

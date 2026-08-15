import { driverService } from '~/services/driverService'

export const useDriverRoutes = () => {
  // Dùng useAsyncData để fetch dữ liệu lúc khởi tạo và lấy caching
  const {
    data: routesResponse,
    status,
    error,
    refresh
  } = useAsyncData('driver-today-routes', () => driverService.getTodayRoutes(), {
    // Không dùng lazy cho phần này vì driver cần xem ngay lập tức
  })

  const driverRoutes = computed(() => routesResponse.value?.data || [])
  const loading = computed(() => status.value === 'pending')

  return {
    driverRoutes,
    loading,
    error,
    refresh
  }
}

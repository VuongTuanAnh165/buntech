import { get, set } from 'idb-keyval'
import { driverService, type DeliverOrderPayload } from '~/services/driverService'

export interface SyncTask {
  id: string
  type: 'DELIVER_ORDER'
  orderId: string | number
  payload: DeliverOrderPayload
  timestamp: number
}

const SYNC_QUEUE_KEY = 'tamhung_driver_offline_sync_queue'

export const useOfflineSync = () => {
  const isSyncing = ref(false)
  const toast = useToast()

  const getQueue = async (): Promise<SyncTask[]> => {
    try {
      const queue = await get<SyncTask[]>(SYNC_QUEUE_KEY)
      return queue || []
    } catch {
      return []
    }
  }

  const saveQueue = async (queue: SyncTask[]) => {
    await set(SYNC_QUEUE_KEY, queue)
  }

  const addToQueue = async (task: Omit<SyncTask, 'id' | 'timestamp'>) => {
    const queue = await getQueue()
    const newTask: SyncTask = {
      ...task,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    }
    queue.push(newTask)
    await saveQueue(queue)
  }

  const processQueue = async () => {
    if (isSyncing.value || !navigator.onLine) return

    const queue = await getQueue()
    if (queue.length === 0) return

    isSyncing.value = true
    let successCount = 0

    // Bật toast thông báo đang đồng bộ
    toast.add({
      id: 'offline_sync',
      title: 'Đang đồng bộ dữ liệu...',
      description: `Đang xử lý ${queue.length} đơn hàng`,
      icon: 'i-lucide-refresh-cw',
      color: 'primary',
      // @ts-expect-error timeout is valid in Nuxt UI v2 but maybe missing in types
      timeout: 0
    })

    const remainingQueue: SyncTask[] = []

    for (const task of queue) {
      if (task.type === 'DELIVER_ORDER') {
        try {
          const res = await driverService.deliverOrder(task.orderId, task.payload)
          if (res.success) {
            successCount++
          } else {
            // Lỗi không xác định từ BE (không throw 500)
            remainingQueue.push(task)
          }
        } catch (error) {
          const err = error as { response?: { status?: number } }
          const status = err.response?.status
          // Nếu lỗi 409 (Optimistic Lock) hoặc 400 (Bad request), có thể bỏ qua không sync lại nữa
          // Hoặc thông báo cho user
          if (status === 409 || status === 400 || status === 404) {
            // Không push vào remainingQueue -> Xóa khỏi queue
          } else {
            // Lỗi mạng hoặc 500 -> Thử lại sau
            remainingQueue.push(task)
          }
        }
      }
    }

    await saveQueue(remainingQueue)
    isSyncing.value = false

    // Cập nhật toast
    toast.remove('offline_sync')

    if (successCount > 0 && remainingQueue.length === 0) {
      toast.add({
        title: 'Đồng bộ hoàn tất',
        description: `Đã đồng bộ ${successCount} đơn hàng thành công`,
        color: 'success',
        icon: 'i-lucide-check-circle-2'
      })
    } else if (remainingQueue.length > 0) {
      toast.add({
        title: 'Đồng bộ chưa hoàn chỉnh',
        description: `Còn ${remainingQueue.length} đơn hàng chưa thể đồng bộ. Sẽ thử lại sau.`,
        color: 'warning',
        icon: 'i-lucide-alert-triangle'
      })
    }
  }

  return {
    isSyncing,
    getQueue,
    addToQueue,
    processQueue
  }
}

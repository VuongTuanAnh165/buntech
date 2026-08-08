import { get, set, del } from 'idb-keyval'

export interface OfflineQueueItem {
  id: string
  url: string
  method: string
  payload: unknown
  createdAt: string
}

const QUEUE_KEY = 'buntech_offline_queue'

export function useOfflineQueue() {
  const getQueue = async (): Promise<OfflineQueueItem[]> => {
    return (await get(QUEUE_KEY)) || []
  }
  const enqueue = async (item: OfflineQueueItem) => {
    const queue = await getQueue()
    queue.push(item)
    await set(QUEUE_KEY, queue)
  }
  const dequeue = async (id: string) => {
    const queue = await getQueue()
    const filtered = queue.filter((q) => q.id !== id)
    await set(QUEUE_KEY, filtered)
  }
  const clear = async () => {
    await del(QUEUE_KEY)
  }
  const size = async (): Promise<number> => {
    return (await getQueue()).length
  }

  return { getQueue, enqueue, dequeue, clear, size }
}

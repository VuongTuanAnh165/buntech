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
  async function getQueue(): Promise<OfflineQueueItem[]> {
    return (await get(QUEUE_KEY)) || []
  }

  async function enqueue(item: OfflineQueueItem) {
    const queue = await getQueue()
    queue.push(item)
    await set(QUEUE_KEY, queue)
  }

  async function dequeue(id: string) {
    const queue = await getQueue()
    const filtered = queue.filter((q) => q.id !== id)
    await set(QUEUE_KEY, filtered)
  }

  async function clear() {
    await del(QUEUE_KEY)
  }

  async function size(): Promise<number> {
    return (await getQueue()).length
  }

  return { getQueue, enqueue, dequeue, clear, size }
}

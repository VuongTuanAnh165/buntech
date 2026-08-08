import {
  mockProfiles, mockCategories, mockProducts, mockReviews, mockCustomPrices,
  mockAddresses, mockOrders, mockOrderItems, mockTransactions, mockInventoryItems,
  mockInventoryMovements, mockBlogCategories, mockBlogPosts, mockSystemConfigs,
} from '../core/mock/data'
import type { Role } from '../enums'

type Row = Record<string, unknown>

function getTableData(table: string): Row[] {
  const map: Record<string, Row[]> = {
    profiles: mockProfiles as Row[],
    categories: mockCategories as Row[],
    products: mockProducts as Row[],
    product_reviews: mockReviews as Row[],
    custom_prices: mockCustomPrices as Row[],
    addresses: mockAddresses as Row[],
    orders: mockOrders as Row[],
    order_items: mockOrderItems as Row[],
    transactions: mockTransactions as Row[],
    inventory_items: mockInventoryItems as Row[],
    inventory_movements: mockInventoryMovements as Row[],
    blog_posts: mockBlogPosts as Row[],
    blog_categories: mockBlogCategories as Row[],
    system_configs: mockSystemConfigs as Row[],
  }
  return (map[table] || []).map(r => ({ ...r }))
}

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

class MockQuery {
  private table: string
  private filters: ((row: Row) => boolean)[] = []
  private orderCol: string | null = null
  private orderAsc = true
  private start = 0
  private end: number | null = null
  private limitN: number | null = null
  private wantCount = false
  private insertPayload: Row | Row[] | null = null
  private updatePayload: Row | null = null
  private isDelete = false
  private isUpsert = false
  private selectMode = false

  constructor(table: string) {
    this.table = table
  }

  select(_columns = '*', options?: { count?: string }) {
    this.selectMode = true
    if (options?.count === 'exact') this.wantCount = true
    return this
  }

  eq(col: string, val: unknown) { this.filters.push(r => r[col] === val); return this }
  neq(col: string, val: unknown) { this.filters.push(r => r[col] !== val); return this }
  is(col: string, val: unknown) { this.filters.push(r => r[col] === val); return this }
  ilike(col: string, pattern: string) {
    const v = pattern.replace(/%/g, '').toLowerCase()
    this.filters.push(r => String(r[col] ?? '').toLowerCase().includes(v))
    return this
  }
  or(conditions: string) {
    const parts = conditions.split(',')
    this.filters.push(r => parts.some(p => {
      const [col, op, val] = p.split('.')
      if (op === 'ilike') return String(r[col] ?? '').toLowerCase().includes((val || '').replace(/%/g, ''))
      if (op === 'eq') return r[col] == val
      return false
    }))
    return this
  }
  gte(col: string, val: unknown) { this.filters.push(r => r[col] >= val); return this }
  lte(col: string, val: unknown) { this.filters.push(r => r[col] <= val); return this }
  in(col: string, vals: unknown[]) { this.filters.push(r => vals.includes(r[col])); return this }
  not(col: string, op: string, val: unknown) {
    if (op === 'is') { this.filters.push(r => r[col] !== val); return this }
    if (op === 'eq') { this.filters.push(r => r[col] !== val); return this }
    return this
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderCol = col
    this.orderAsc = options?.ascending ?? true
    return this
  }

  range(start: number, end: number) { this.start = start; this.end = end; return this }
  limit(n: number) { this.limitN = n; return this }

  insert(payload: Row | Row[]) { this.insertPayload = payload; return this }
  update(payload: Row) { this.updatePayload = payload; return this }
  delete() { this.isDelete = true; return this }
  upsert(payload: Row, _opts?: { onConflict?: string }) { this.updatePayload = payload; this.isUpsert = true; return this }

  async maybeSingle() {
    const res = await this.execute()
    return { data: res.data?.[0] ?? null, error: null as unknown }
  }

  async single() {
    const res = await this.execute()
    return { data: res.data?.[0] ?? null, error: null as unknown }
  }

  then<TResult>(resolve: (v: { data: Row[] | null; count: number | null; error: unknown }) => TResult) {
    return this.execute().then(resolve)
  }

  private execute() {
    let data = getTableData(this.table)

    if (this.insertPayload) {
      const payload = Array.isArray(this.insertPayload) ? this.insertPayload : [this.insertPayload]
      const newRows = payload.map(p => {
        const row = { ...p, id: (p.id as string) || uid(this.table.slice(0, 3)), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        getTableData(this.table).push(row)
        return row
      })
      return Promise.resolve({ data: newRows, count: null, error: null })
    }

    if (this.isDelete) {
      const tableArr = getTableData(this.table)
      for (let i = tableArr.length - 1; i >= 0; i--) {
        if (this.filters.every(f => f(tableArr[i]))) {
          tableArr.splice(i, 1)
        }
      }
      return Promise.resolve({ data: null, count: null, error: null })
    }

    if (this.updatePayload && !this.isUpsert) {
      const tableArr = getTableData(this.table)
      const updated: Row[] = []
      for (const row of tableArr) {
        if (this.filters.every(f => f(row))) {
          Object.assign(row, this.updatePayload, { updated_at: new Date().toISOString() })
          updated.push({ ...row })
        }
      }
      return Promise.resolve({ data: updated, count: null, error: null })
    }

    if (this.isUpsert) {
      const tableArr = getTableData(this.table)
      const key = Object.keys(this.updatePayload!)[0]
      const existing = tableArr.find(r => r[key] === (this.updatePayload as Row)[key])
      if (existing) {
        Object.assign(existing, this.updatePayload, { updated_at: new Date().toISOString() })
      } else {
        tableArr.push({ ...this.updatePayload!, id: uid(this.table.slice(0, 3)), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      }
      return Promise.resolve({ data: null, count: null, error: null })
    }

    for (const f of this.filters) data = data.filter(f)

    if (this.orderCol) {
      data = [...data].sort((a, b) => {
        const av = a[this.orderCol!]
        const bv = b[this.orderCol!]
        if (av == null) return 1
        if (bv == null) return -1
        if (av < bv) return this.orderAsc ? -1 : 1
        if (av > bv) return this.orderAsc ? 1 : -1
        return 0
      })
    }

    const count = data.length

    if (this.end !== null) data = data.slice(this.start, this.end + 1)
    else if (this.limitN !== null) data = data.slice(this.start, this.start + this.limitN)

    return Promise.resolve({ data, count: this.wantCount ? count : null, error: null })
  }
}

const mockSession = { user: { id: 'usr-0001', email: 'admin@buntech.vn' } }
let sessionActive = false
let currentUserId: string | null = null

function createMockClient() {
  return {
    from(table: string) { return new MockQuery(table) },

    auth: {
      async signInWithPassword(creds: { email: string; password: string }) {
        if (creds.email === 'admin@buntech.vn' && creds.password === '123456') {
          sessionActive = true
          currentUserId = 'usr-0001'
          return { data: { user: { id: 'usr-0001', email: 'admin@buntech.vn' } }, error: null }
        }
        if (creds.email === 'driver@buntech.vn' && creds.password === '123456') {
          sessionActive = true
          currentUserId = 'usr-0003'
          return { data: { user: { id: 'usr-0003', email: 'driver@buntech.vn' } }, error: null }
        }
        if (creds.email === 'customer@buntech.vn' && creds.password === '123456') {
          sessionActive = true
          currentUserId = 'usr-0008'
          return { data: { user: { id: 'usr-0008', email: 'customer@buntech.vn' } }, error: null }
        }
        return { data: { user: null }, error: { message: 'Invalid credentials' } }
      },
      async signOut() { sessionActive = false; currentUserId = null; return { error: null } },
      async getSession() {
        return { data: { session: sessionActive ? mockSession : null } }
      },
      async getUser() {
        if (!sessionActive || !currentUserId) return { data: { user: null } }
        const profile = mockProfiles.find(p => p.id === currentUserId)
        return { data: { user: { id: currentUserId, email: profile?.phone ? `${profile.phone}@buntech.vn` : 'admin@buntech.vn', user_metadata: { full_name: profile?.full_name, role: profile?.role, phone: profile?.phone, avatar_url: profile?.avatar_url } } } }
      },
      onAuthStateChange(_cb: (event: string, session: unknown) => void) {
        return { data: { subscription: { unsubscribe() {} } } }
      },
      async updateUser(_opts: { password?: string }) { return { error: null } },
      admin: {
        async createUser(opts: { email: string; password: string; user_metadata?: Record<string, unknown> }) {
          const role = (opts.user_metadata?.role as Role) || 'CUSTOMER'
          const newProfile = {
            id: uid('usr'),
            role,
            phone: opts.user_metadata?.phone as string || null,
            full_name: opts.user_metadata?.full_name as string || '',
            status: 'ACTIVE',
            debt_limit: 0,
            avatar_url: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          mockProfiles.push(newProfile as never)
          return { data: { user: { id: newProfile.id, email: opts.email } }, error: null }
        },
      },
    },
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      supabase: createMockClient(),
    },
  }
})

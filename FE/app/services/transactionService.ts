import { ApiClient } from '~/utils/api'

export interface UserSummary {
  id: number
  full_name: string
  phone_number: string | null
  profile?: {
    avatar_url: string | null
  }
  avatar_url?: string | null
  current_debt?: number
}

export interface Transaction extends Record<string, unknown> {
  id: number
  userId: number
  amount: number
  type: string
  paymentMethod: string
  referenceCode: string | null
  transactionDate: string
  createdAt: string
  user?: UserSummary
}

export interface PaginatedTransactions {
  data: Transaction[]
  meta: {
    total: number
    perPage: number
    currentPage: number
    lastPage: number
  }
}

export interface DebtSummary {
  totalDebt: number
  topDebtors: UserSummary[]
}

export const transactionService = {
  getTransactions(page = 1, limit = 20, type?: string, userId?: number, search?: string) {
    return ApiClient.get<{ success: boolean; data: PaginatedTransactions }>('/admin/transactions', {
      page,
      limit,
      type,
      userId,
      search
    })
  },

  getDebtSummary() {
    return ApiClient.get<{ success: boolean; data: DebtSummary }>('/admin/finance/debt-summary')
  },

  payDebt(payload: {
    userId: number
    amount: number
    paymentMethod: string
    referenceCode?: string
    note?: string
    transactionDate?: string
  }) {
    return ApiClient.post<{ success: boolean; data: Transaction }>(
      '/admin/transactions/pay-debt',
      payload
    )
  }
}

import Transaction from '#models/transaction'
import UserProfile from '#models/user_profile'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class TransactionService {
  /**
   * Lấy danh sách Sổ cái các khoản thu chi
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    filters?: { userId?: number; type?: string }
  ) {
    const query = Transaction.query().orderBy('created_at', 'desc')

    if (filters?.userId) {
      query.where('user_id', filters.userId)
    }
    if (filters?.type) {
      query.where('type', filters.type)
    }

    return query.paginate(page, limit)
  }

  /**
   * Thanh toán nợ (Pay Debt)
   * Giảm current_debt của UserProfile và ghi log Transaction
   */
  async payDebt(data: {
    userId: number
    amount: number
    paymentMethod: string
    referenceCode?: string
    transactionDate?: Date
    note?: string
  }) {
    return await db.transaction(async (trx) => {
      // 1. Lock UserProfile row for update to prevent Race Condition
      const profile = await UserProfile.query({ client: trx })
        .where('user_id', data.userId)
        .forUpdate() // CRITICAL: Row-level lock
        .firstOrFail()

      // 2. Calculate new debt
      // DB stores as string (decimal), parse it to float, then back to string
      const currentDebtFloat = Number.parseFloat(profile.currentDebt || '0')
      const newDebt = currentDebtFloat - data.amount

      // Update profile
      profile.currentDebt = newDebt.toString()
      profile.useTransaction(trx)
      await profile.save()

      // 3. Create Transaction Record
      const transaction = new Transaction()
      transaction.userId = data.userId
      transaction.amount = data.amount.toString()
      transaction.type = 'PAYMENT'
      transaction.paymentMethod = data.paymentMethod
      transaction.referenceCode = data.referenceCode || null
      transaction.transactionDate = data.transactionDate
        ? DateTime.fromJSDate(data.transactionDate)
        : DateTime.now()

      // Assuming we have a note column or similar, if not we skip it or store in metadata if available.
      // Based on schema, we don't have a note column, so we ignore note for now.

      transaction.useTransaction(trx)
      await transaction.save()

      return {
        transaction,
        newDebt: profile.currentDebt,
      }
    })
  }

  /**
   * Lấy báo cáo Tổng kết công nợ
   */
  async getDebtSummary() {
    // We sum the currentDebt from all UserProfiles
    const result = await db
      .from('user_profiles')
      .whereNull('deleted_at')
      .sum('current_debt as total_debt')
      .first()

    const totalDebt = result?.total_debt || '0'

    // Get top debtors
    const topDebtors = await db
      .from('user_profiles')
      .join('users', 'users.id', 'user_profiles.user_id')
      .whereNull('user_profiles.deleted_at')
      .where('current_debt', '>', 0)
      .select('users.id', 'users.full_name', 'users.phone_number', 'user_profiles.current_debt')
      .orderBy('current_debt', 'desc')
      .limit(10)

    return {
      totalDebt: totalDebt.toString(),
      topDebtors,
    }
  }
}

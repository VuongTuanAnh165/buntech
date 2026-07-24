import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import TransactionService from '#services/transaction_service'
import { payDebtValidator } from '#validators/transaction_validator'

@inject()
export default class TransactionsController {
  constructor(protected transactionService: TransactionService) {}

  /**
   * @index
   * @summary Danh sách giao dịch
   * @description Lấy danh sách Sổ cái các khoản thu chi/công nợ
   * @paramQuery page - Trang hiện tại
   * @paramQuery limit - Số lượng trên mỗi trang
   * @paramQuery userId - ID Khách hàng
   * @paramQuery type - Loại giao dịch
   * @responseBody 200 - <PaginatedTransactionListResponse>
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const userId = request.input('userId')
    const type = request.input('type')

    const transactions = await this.transactionService.getTransactions(page, limit, {
      userId,
      type,
    })

    return response.ok({
      success: true,
      message: 'Lấy danh sách giao dịch thành công',
      data: transactions,
    })
  }

  /**
   * @payDebt
   * @summary Thanh toán nợ
   * @description Ghi nhận khách hàng trả nợ, tự động trừ vào current_debt của khách.
   * @requestBody <payDebtValidator>
   * @responseBody 200 - <TransactionResponse>
   */
  async payDebt({ request, response }: HttpContext) {
    const payload = await request.validateUsing(payDebtValidator)

    // Typecast Date to JS Date if provided by VineJS (which parses it)
    const transaction = await this.transactionService.payDebt({
      ...payload,
      transactionDate: payload.transactionDate as Date | undefined,
    })

    return response.ok({
      success: true,
      message: 'Thanh toán nợ thành công',
      data: transaction,
    })
  }

  /**
   * @debtSummary
   * @summary Tổng kết nợ
   * @description Xem tổng nợ toàn hệ thống và top khách hàng nợ nhiều nhất
   * @responseBody 200 - <DebtSummaryResponse>
   */
  async debtSummary({ response }: HttpContext) {
    const summary = await this.transactionService.getDebtSummary()

    return response.ok({
      success: true,
      message: 'Lấy tổng kết công nợ thành công',
      data: summary,
    })
  }
}

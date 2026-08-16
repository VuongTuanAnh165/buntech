import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AddressService from '#services/address_service'

@inject()
export default class CustomerAddressesController {
  constructor(protected addressService: AddressService) {}

  /**
   * @index
   * @summary Lấy địa chỉ của tôi
   * @description Lấy danh sách địa chỉ giao hàng của khách sỉ đang đăng nhập
   * @responseBody 200 - <AddressListArrayResponse>
   */
  async index({ response, auth }: HttpContext) {
    const userId = auth.user!.id
    const addresses = await this.addressService.getUserAddresses(userId)

    return response.ok({
      success: true,
      message: 'Lấy danh sách địa chỉ thành công',
      data: addresses,
    })
  }
}

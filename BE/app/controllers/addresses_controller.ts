import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core'
import AddressService from '#services/address_service'
import { createAddressValidator, updateAddressValidator } from '#validators/address_validator'

@inject()
export default class AddressesController {
  constructor(protected addressService: AddressService) {}

  /**
   * @summary Danh sách địa chỉ
   * @description Lấy danh sách địa chỉ giao hàng của một user
   * @paramPath userId - ID người dùng
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": [{"id": 1, "addressLine": "string", "isDefault": true}]}
   */
  async index({ params, response }: HttpContext) {
    const addresses = await this.addressService.getUserAddresses(params.userId)

    return response.ok({
      success: true,
      message: 'Lấy danh sách địa chỉ thành công',
      data: addresses,
    })
  }

  /**
   * @summary Thêm địa chỉ mới
   * @description Tạo mới địa chỉ giao hàng cho user
   * @paramPath userId - ID người dùng
   * @requestBody {"addressLine": "string", "province": "string", "ward": "string", "isDefault": true}
   * @responseBody 201 - {"success": true, "message": "Thành công", "data": {"id": 1}}
   */
  async store({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(createAddressValidator)
    const address = await this.addressService.createAddress(params.userId, payload)

    return response.created({
      success: true,
      message: 'Tạo địa chỉ thành công',
      data: address,
    })
  }

  /**
   * @summary Chi tiết địa chỉ
   * @description Xem thông tin chi tiết của một địa chỉ
   * @paramPath userId - ID người dùng
   * @paramPath id - ID địa chỉ
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1}}
   */
  async show({ params, response }: HttpContext) {
    const address = await this.addressService.getAddress(params.userId, params.id)

    return response.ok({
      success: true,
      message: 'Lấy thông tin địa chỉ thành công',
      data: address,
    })
  }

  /**
   * @summary Cập nhật địa chỉ
   * @description Chỉnh sửa thông tin địa chỉ hoặc set địa chỉ mặc định
   * @paramPath userId - ID người dùng
   * @paramPath id - ID địa chỉ
   * @requestBody {"addressLine": "string", "isDefault": true}
   * @responseBody 200 - {"success": true, "message": "Thành công", "data": {"id": 1}}
   */
  async update({ params, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateAddressValidator)
    const address = await this.addressService.updateAddress(params.userId, params.id, payload)

    return response.ok({
      success: true,
      message: 'Cập nhật địa chỉ thành công',
      data: address,
    })
  }

  /**
   * @summary Xóa địa chỉ
   * @description Xóa một địa chỉ khỏi danh bạ của user
   * @paramPath userId - ID người dùng
   * @paramPath id - ID địa chỉ
   * @responseBody 200 - {"success": true, "message": "Thành công"}
   */
  async destroy({ params, response }: HttpContext) {
    await this.addressService.deleteAddress(params.userId, params.id)

    return response.ok({
      success: true,
      message: 'Xóa địa chỉ thành công',
    })
  }
}

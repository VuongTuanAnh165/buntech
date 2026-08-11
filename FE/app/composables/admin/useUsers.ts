import {
  userService,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UpdateProfilePayload,
  type CreateAddressPayload
} from '~/services/userService'

export function useUsers() {
  const fetchUsers = async (params?: Record<string, unknown>) => {
    return await userService.fetchUsers(params)
  }

  const getUser = async (id: string | number) => {
    return await userService.getUser(id)
  }

  const createUser = async (payload: CreateUserPayload) => {
    return await userService.createUser(payload)
  }

  const updateUser = async (id: string | number, payload: UpdateUserPayload) => {
    return await userService.updateUser(id, payload)
  }

  const updateProfile = async (id: string | number, payload: UpdateProfilePayload) => {
    return await userService.updateProfile(id, payload)
  }

  const deleteUser = async (id: string | number) => {
    return await userService.deleteUser(id)
  }

  const fetchAddresses = async (userId: string | number) => {
    return await userService.fetchAddresses(userId)
  }

  const createAddress = async (userId: string | number, payload: CreateAddressPayload) => {
    return await userService.createAddress(userId, payload)
  }

  const updateAddress = async (
    userId: string | number,
    addressId: string | number,
    payload: CreateAddressPayload
  ) => {
    return await userService.updateAddress(userId, addressId, payload)
  }

  const deleteAddress = async (userId: string | number, addressId: string | number) => {
    return await userService.deleteAddress(userId, addressId)
  }

  return {
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    updateProfile,
    deleteUser,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress
  }
}

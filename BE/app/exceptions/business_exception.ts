import { Exception } from '@adonisjs/core/exceptions'

export default class BusinessException extends Exception {
  public errorCode?: string

  constructor(message: string, status: number = 400, errorCode?: string) {
    super(message, { status })
    this.errorCode = errorCode
  }
}

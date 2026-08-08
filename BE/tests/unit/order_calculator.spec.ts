import { test } from '@japa/runner'
import OrderCalculatorService from '#services/order_calculator_service'
import app from '@adonisjs/core/services/app'

test.group('Order Calculator Service', () => {
  test('calculate order without custom prices', async ({ assert }) => {
    const service = await app.container.make(OrderCalculatorService)

    // Test that an empty array of items returns totalAmount 0
    const result = await service.calculateOrder([], 1)

    assert.equal(result.totalAmount, 0)
    assert.deepEqual(result.orderItemsData, [])
  })
})

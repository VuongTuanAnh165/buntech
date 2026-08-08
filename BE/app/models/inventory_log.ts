import { InventoryLogSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import RawMaterial from '#models/raw_material'

export default class InventoryLog extends InventoryLogSchema {
  @belongsTo(() => RawMaterial, { foreignKey: 'materialId' })
  declare rawMaterial: BelongsTo<typeof RawMaterial>
}

import type { ConstantKey } from '../enums/constantKeys'

export type MasterDataConstants = Record<ConstantKey, Record<string, string>>

export interface Division {
  id: string
  name: string
  children?: Division[]
}

export interface MasterDataVersionResponse {
  versionHash: string
}

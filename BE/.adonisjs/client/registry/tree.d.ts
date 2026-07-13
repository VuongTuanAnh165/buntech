/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    login: typeof routes['auth.login']
    refresh: typeof routes['auth.refresh']
    me: typeof routes['auth.me']
  }
  masterData: {
    getDivisionsVersion: typeof routes['master_data.get_divisions_version']
    getDivisions: typeof routes['master_data.get_divisions']
  }
}

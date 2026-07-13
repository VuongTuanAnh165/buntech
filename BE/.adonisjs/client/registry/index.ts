/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.login']['types'],
  },
  'auth.refresh': {
    methods: ["POST"],
    pattern: '/api/v1/auth/refresh',
    tokens: [{"old":"/api/v1/auth/refresh","type":0,"val":"api","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/refresh","type":0,"val":"refresh","end":""}],
    types: placeholder as Registry['auth.refresh']['types'],
  },
  'auth.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth.me']['types'],
  },
  'master_data.get_divisions_version': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/master-data/divisions/version',
    tokens: [{"old":"/api/v1/master-data/divisions/version","type":0,"val":"api","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"v1","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"master-data","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"divisions","end":""},{"old":"/api/v1/master-data/divisions/version","type":0,"val":"version","end":""}],
    types: placeholder as Registry['master_data.get_divisions_version']['types'],
  },
  'master_data.get_divisions': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/master-data/divisions',
    tokens: [{"old":"/api/v1/master-data/divisions","type":0,"val":"api","end":""},{"old":"/api/v1/master-data/divisions","type":0,"val":"v1","end":""},{"old":"/api/v1/master-data/divisions","type":0,"val":"master-data","end":""},{"old":"/api/v1/master-data/divisions","type":0,"val":"divisions","end":""}],
    types: placeholder as Registry['master_data.get_divisions']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}

import { ApiResponse, ApiExtraModels, ApiQuery } from '@foadonis/openapi/decorators'

/**
 * Custom decorator for OK (200) JSON response with { success: true, data: Model }
 */
export function ApiOkResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: `#/components/schemas/${model.name}` },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for OK (200) JSON response with { success: true, message: string, data: Model }
 */
export function ApiOkMessageResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { $ref: `#/components/schemas/${model.name}` },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for OK (200) JSON response with { success: true, message: string }
 */
export function ApiOkMessageOnlyResponse() {
  return function (target: any, propertyKey: string) {
    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for OK (200) JSON response with { success: true, data: Model[] }
 */
export function ApiOkListResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model.name}` },
          },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for OK (200) JSON response with { success: true, message: string, data: Model[] }
 */
export function ApiOkMessageListResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model.name}` },
          },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for Created (201) JSON response with { success: true, data: Model }
 */
export function ApiCreatedResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 201,
      description: 'Created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: { $ref: `#/components/schemas/${model.name}` },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for Created (201) JSON response with { success: true, message: string, data: Model }
 */
export function ApiCreatedMessageResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 201,
      description: 'Created successfully',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { $ref: `#/components/schemas/${model.name}` },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for Paginated (200) response with { success: true, data: Model[], meta }
 */
export function ApiPaginatedResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model.name}` },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer' },
              pageSize: { type: 'integer' },
              total: { type: 'integer' },
              totalPages: { type: 'integer' },
            },
          },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for Paginated (200) response with message: { success: true, message: string, data: Model[], meta }
 */
export function ApiPaginatedMessageResponse(model: Function) {
  return function (target: any, propertyKey: string) {
    ApiExtraModels(model)(target.constructor)

    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'array',
            items: { $ref: `#/components/schemas/${model.name}` },
          },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for standard pagination queries (page, limit)
 */
export function ApiPaginationQuery() {
  return function (target: any, propertyKey: string) {
    ApiQuery({ name: 'page', required: false, type: 'integer', description: 'Page number' })(target, propertyKey)
    ApiQuery({ name: 'limit', required: false, type: 'integer', description: 'Items per page' })(target, propertyKey)
  }
}

/**
 * Custom decorator for Master Data: Divisions Version
 */
export function ApiDivisionVersionResponse() {
  return function (target: any, propertyKey: string) {
    ApiResponse({
      status: 200,
      description: 'Current administrative divisions version hash',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              versionHash: { type: 'string' },
            },
          },
        },
      },
    })(target, propertyKey)
  }
}

/**
 * Custom decorator for Master Data: Divisions Tree
 */
export function ApiDivisionTreeResponse() {
  return function (target: any, propertyKey: string) {
    ApiResponse({
      status: 200,
      description: 'Administrative divisions tree data (supports 304 via ETag)',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                level: { type: 'integer' },
                children: { type: 'array', items: { type: 'object' } },
              },
            },
          },
        },
      },
    })(target, propertyKey)
  }
}

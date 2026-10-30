/*
 * primitive type assertions
 */
export function isArray (value: unknown): boolean {
  return Array.isArray(value)
}

export function isBoolean (value: unknown): boolean {
  return typeof value === 'boolean'
}

export function isFunction (value: unknown): boolean {
  return typeof value === 'function'
}

export function isInteger (value: unknown): boolean {
  return Number.isInteger(value)
}

export function isNumber (value: unknown): boolean {
  return typeof value === 'number'
}

export function isObject (value: unknown): boolean {
  return (typeof value === 'object' && value !== null && !Array.isArray(value))
}

export function isString (value: unknown): boolean {
  return typeof value === 'string'
}

export function isUndefined (value: unknown): boolean {
  return typeof value === 'undefined'
}

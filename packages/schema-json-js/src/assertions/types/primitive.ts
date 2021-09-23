/*
 * primitive type assertions
 */
export function isArray (value): boolean {
  return Array.isArray(value)
}

export function isBoolean (value): boolean {
  return typeof value === 'boolean'
}

export function isFunction (value): boolean {
  return typeof value === 'function'
}

export function isInteger (value): boolean {
  return Number.isInteger(value)
}

export function isNumber (value): boolean {
  return typeof value === 'number'
}

export function isObject (value): boolean {
  return (typeof value === 'object' && value !== null && !Array.isArray(value))
}

export function isString (value): boolean {
  return typeof value === 'string'
}

export function isUndefined (value): boolean {
  return typeof value === 'undefined'
}

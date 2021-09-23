/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { JSONSchema } from '../../@types'
import { isArray, isBoolean, isObject } from './primitive'

const isGenericKeyRegex = /^(?:const|enum)$/
const isObjKeyRegex = /^(?:properties|patternProperties|dependencies|definitions)$/
const isSchemaTypeRegex = /^(?:array|boolean|integer|null|number|object|string)$/
const isUrlRegex = /^(?:((?:(http|https):\/\/)(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])(?:\.(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]))*(?::\d+)?\/)?((?:~(?=[01])|[^~])*)|#(?:~(?=[01])|[^~])*)$/

/*
 * complex type assertions
 */
export function deepEqual (value, control): boolean {
  if (isArray(control)) {
    if (!isArray(value)) return false
    if (value.length !== control.length) return false

    let i = control.length
    while (i--) {
      if (!deepEqual(value[i], control[i])) return false
    }
  } else if (typeof control === 'object' && control !== null) {
    if (!isObject(value)) return false

    const keys = Object.keys(control)
    if (keys.length !== Object.keys(value).length) return false

    let i = keys.length
    while (i--) {
      if (!deepEqual(value[keys[i]], control[keys[i]])) return false
    }
  } else if (value !== control) return false

  return true
}

export function isEnum (value: any[], assertion?: (value) => boolean): boolean {
  if (!isArray(value) || value.length === 0) return false

  const enumSet = new Set()
  let index = value.length
  while (index--) {
    value[index] && typeof value[index] === 'object'
      ? enumSet.add(JSON.stringify(value[index]))
      : enumSet.add(value[index])
  }
  if (value.length !== enumSet.size) return false

  if (assertion !== undefined) {
    let i = value.length
    while (i--) {
      if (!assertion(value[i])) return false
    }
  }
  return true
}

export function isParentKeyword (parents: string[]): boolean {
  const len = parents.length

  let check = false
  if (isObjKeyRegex.test(parents[len - 1])) check = true
  if (parents[len - 2] === 'properties') check = false

  let index = parents.length
  while (index--) {
    if (isGenericKeyRegex.test(parents[index])) check = true
  }
  return check
}

export function isPathFragment ($ref: string): boolean {
  return $ref[$ref.length - 1] === '/'
}

export function isRef (ref: string): string[] {
  return isUrlRegex.exec(decodeURI(ref)) ?? []
}

export function isSchema (schema: JSONSchema|boolean): boolean {
  return isObject(schema) || isBoolean(schema)
}

export function isSchemaType (type): boolean {
  return isSchemaTypeRegex.test(type)
}

export function isSubSchema ($id: string, path: string[]): boolean {
  const match = isRef($id)
  return isArray(match) && typeof match[1] === 'string' && typeof match[2] === 'string' && path[path.length - 2] === 'definitions'
}

export function isTypedArray (value: any[], assertion: (value) => boolean): boolean {
  let index = value.length
  while (index--) {
    if (!assertion(value[index])) return false
  }
  return true
}

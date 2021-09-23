/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { JSONSchema, ValidationFunc } from '../../@types'
import { OPTIMIZED, isArray, isSchema, isTypedArray, isUndefined } from '../types'

export default class AssertLogical {
  private static instance: AssertLogical

  private constructor () {}

  static getInstance (): AssertLogical {
    if (isUndefined(AssertLogical.instance)) AssertLogical.instance = new AssertLogical()
    return AssertLogical.instance
  }

  /*
   * logical operation keyword assertions
   */
  optimizeAllOf (schema): ValidationFunc[] {
    const { allOf } = schema
    if (isUndefined(allOf)) return []

    if (!isArray(allOf) || !isTypedArray(allOf, isSchema)) {
      throw new TypeError('#allOf: keyword should be an array of JSON Schemas')
    }

    return [(value, ref: JSONSchema) => {
      if (ref.allOf) {
        let error
        for (let index = 0, length = ref.allOf.length; index < length; index++) {
          if (ref.allOf[index] === false) {
            return '#allOf: \'false\' JSON Schema invalidates all values'
          } else if (ref.allOf[index][OPTIMIZED]) {
            error = ref.allOf[index][OPTIMIZED](value, ref.allOf[index])
            if (error) return error
          }
        }
      }
    }]
  }

  optimizeAnyOf (schema): ValidationFunc[] {
    const { anyOf } = schema
    if (isUndefined(anyOf)) return []

    if (!isArray(anyOf) || !isTypedArray(anyOf, isSchema)) {
      throw new TypeError('#anyOf: keyword should be an array of JSON Schemas')
    }

    return [(value, ref: JSONSchema) => {
      if (ref.anyOf) {
        for (let index = 0, length = ref.anyOf.length; index < length; index++) {
          if (ref.anyOf[index] === true) return
          else if (ref.anyOf[index][OPTIMIZED] && !ref.anyOf[index][OPTIMIZED](value, ref.anyOf[index])) {
            return
          }
        }
        return '#anyOf: none of the defined JSON Schemas match the value'
      }
    }]
  }

  optimizeNot (schema): ValidationFunc[] {
    const { not } = schema
    if (isUndefined(not)) return []

    if (!isSchema(not)) {
      throw new TypeError('#not: keyword should be a JSON Schema')
    }

    return [(value, ref: JSONSchema) => {
      if (ref.not === false) return
      else if (ref.not && ref.not[OPTIMIZED] && ref.not[OPTIMIZED](value, ref.not)) return // eslint-disable-line @typescript-eslint/prefer-optional-chain
      return '#not: value validated successfully against the schema'
    }]
  }

  optimizeOneOf (schema): ValidationFunc[] {
    const { oneOf } = schema
    if (isUndefined(oneOf)) return []

    if (!isArray(oneOf) || !isTypedArray(oneOf, isSchema)) {
      throw new TypeError('#oneOf: keyword should be an array of JSON Schemas')
    }

    return [(value, ref: JSONSchema) => {
      if (ref.oneOf) {
        const length = oneOf.length
        let count = 1

        for (let index = 0; index < length; index++) {
          if (ref.oneOf[index] === false) count++
          else if (ref.oneOf[index][OPTIMIZED] && ref.oneOf[index][OPTIMIZED](value, ref.oneOf[index])) { // eslint-disable-line @typescript-eslint/prefer-optional-chain
            count++
          }
        }
        if (count !== length) {
          return '#oneOf: value should match only one of the listed schemas'
        }
      }
    }]
  }
}

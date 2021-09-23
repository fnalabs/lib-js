/* eslint-disable @typescript-eslint/restrict-template-expressions,@typescript-eslint/strict-boolean-expressions */
import { ValidationFunc, AssertionFunc } from '../../@types'
import { isBoolean, isInteger, isNumber, isUndefined } from '../types'

export default class AssertNumber {
  private static instance: AssertNumber

  private constructor () {}

  static getInstance (): AssertNumber {
    if (isUndefined(AssertNumber.instance)) AssertNumber.instance = new AssertNumber()
    return AssertNumber.instance
  }

  /*
   * number assertions
   */
  optimize (schema): ValidationFunc[] {
    const { type, exclusiveMaximum, exclusiveMinimum, maximum, minimum, multipleOf } = schema

    const assertion = type === 'integer' ? isInteger : isNumber

    // perform remaining validations defined in schema
    if (!isUndefined(maximum)) AssertNumber.ASSERT_MAX(assertion, maximum, exclusiveMaximum)
    if (!isUndefined(minimum)) AssertNumber.ASSERT_MIN(assertion, minimum, exclusiveMinimum)
    if (!isUndefined(multipleOf)) AssertNumber.ASSERT_MULTIPLE(assertion, multipleOf)

    // return validations based on defined keywords
    return type === 'integer'
      ? AssertNumber.OPTIMIZE_INTEGER(schema)
      : AssertNumber.OPTIMIZE_NUMBER(schema)
  }

  static OPTIMIZE_INTEGER (schema): ValidationFunc[] {
    const { type, exclusiveMaximum, exclusiveMinimum, maximum, minimum, multipleOf } = schema

    if (isInteger(maximum) || isInteger(exclusiveMaximum) || isInteger(minimum) || isInteger(exclusiveMinimum) || isInteger(multipleOf)) {
      return [(value: number, ref) => {
        if (!Number.isInteger(value)) {
          if (ref.type === 'integer') return `#type: value is not a(n) ${ref.type}`
          return
        }
        if (ref.maximum && ((ref.exclusiveMaximum && value >= ref.maximum) ?? value > ref.maximum)) {
          return `#maximum: ${value} is greater than or equal to ${ref.maximum}`
        }
        if (ref.exclusiveMaximum && value >= ref.exclusiveMaximum) {
          return `#exclusiveMaximum: ${value} is greater than or equal to ${ref.exclusiveMaximum}`
        }
        if (ref.minimum && ((ref.exclusiveMinimum && value <= ref.minimum) ?? value < ref.minimum)) {
          return `#minimum: ${value} is less than or equal to ${ref.minimum}`
        }
        if (ref.exclusiveMinimum && value <= ref.exclusiveMinimum) {
          return `#exclusiveMinimum: ${value} is less than or equal to ${ref.exclusiveMinimum}`
        }
        if (ref.multipleOf && (value / ref.multipleOf) % 1 !== 0) {
          return `#multipleOf: ${value} is not a multiple of ${ref.multipleOf}`
        }
      }]
    } else if (type === 'integer') {
      return [value => {
        if (!Number.isInteger(value)) return '#type: value is not an integer'
      }]
    }
    return []
  }

  static OPTIMIZE_NUMBER (schema): ValidationFunc[] {
    const { type, exclusiveMaximum, exclusiveMinimum, maximum, minimum, multipleOf } = schema

    if (isNumber(maximum) || isNumber(exclusiveMaximum) || isNumber(minimum) || isNumber(exclusiveMinimum) || isNumber(multipleOf)) {
      return [(value: number, ref) => {
        if (typeof value !== 'number') {
          if (ref.type === 'number') return `#type: value is not a(n) ${ref.type}`
          return
        }
        if (ref.maximum && ((ref.exclusiveMaximum && value >= ref.maximum) ?? value > ref.maximum)) {
          return `#maximum: ${value} is greater than or equal to ${ref.maximum}`
        }
        if (ref.exclusiveMaximum && value >= ref.exclusiveMaximum) {
          return `#exclusiveMaximum: ${value} is greater than or equal to ${ref.exclusiveMaximum}`
        }
        if (ref.minimum && ((ref.exclusiveMinimum && value <= ref.minimum) ?? value < ref.minimum)) {
          return `#minimum: ${value} is less than or equal to ${ref.minimum}`
        }
        if (ref.exclusiveMinimum && value <= ref.exclusiveMinimum) {
          return `#exclusiveMinimum: ${value} is less than or equal to ${ref.exclusiveMinimum}`
        }
        if (ref.multipleOf && (value / ref.multipleOf) % 1 !== 0) {
          return `#multipleOf: ${value} is not a multiple of ${ref.multipleOf}`
        }
      }]
    } else if (type === 'number') {
      return [value => {
        if (typeof value !== 'number') return '#type: value is not a number'
      }]
    }
    return []
  }

  static ASSERT_MAX (assertion: AssertionFunc, maximum, exclusive = false): void {
    if (isNumber(exclusive)) exclusive = false

    if (!assertion(maximum)) {
      throw new TypeError('#maximum: keyword is not the right type')
    }
    if (!isBoolean(exclusive)) {
      throw new TypeError('#exclusiveMaximum: keyword is not a boolean')
    }
  }

  static ASSERT_MIN (assertion: AssertionFunc, minimum, exclusive = false): void {
    if (isNumber(exclusive)) exclusive = false

    if (!assertion(minimum)) {
      throw new TypeError('#minimum: keyword is not the right type')
    }
    if (!isBoolean(exclusive)) {
      throw new TypeError('#exclusiveMinimum: keyword is not a boolean')
    }
  }

  static ASSERT_MULTIPLE (assertion: AssertionFunc, multipleOf): void {
    if (!assertion(multipleOf)) {
      throw new TypeError('#multipleOf: keyword is not the right type')
    }
  }
}

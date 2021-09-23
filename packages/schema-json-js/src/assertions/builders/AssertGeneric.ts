/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { ValidationFunc } from '../../@types'
import { deepEqual, isEnum, isUndefined } from '../types'

export default class AssertGeneric {
  private static instance: AssertGeneric

  private constructor () {}

  static getInstance (): AssertGeneric {
    if (isUndefined(AssertGeneric.instance)) AssertGeneric.instance = new AssertGeneric()
    return AssertGeneric.instance
  }

  /*
   * generic keyword assertions
   */
  optimize (schema): ValidationFunc[] {
    const list: ValidationFunc[] = []

    if (!isUndefined(schema.const)) list.push(AssertGeneric.ASSERT_CONST())
    if (!isUndefined(schema.enum)) list.push(AssertGeneric.ASSERT_ENUM(schema))

    return list
  }

  static ASSERT_CONST (): ValidationFunc {
    return (value, ref) => {
      if (typeof ref.const === 'object' && ref.const !== null && deepEqual(value, ref.const)) return
      else if (value === ref.const) return

      return '#const: value does not match the defined const'
    }
  }

  static ASSERT_ENUM (schema): ValidationFunc {
    if (!isEnum(schema.enum)) {
      throw new TypeError('#enum: invalid enum, check format and for duplicates')
    }

    return (value, ref) => {
      if (ref.enum) {
        let index = ref.enum.length
        while (index--) {
          if (typeof ref.enum[index] === 'object' && ref.enum[index] !== null && deepEqual(value, ref.enum[index])) return
          else if (value === ref.enum[index]) return
        }
        return '#enum: value does not match anything in the enum'
      }
    }
  }
}

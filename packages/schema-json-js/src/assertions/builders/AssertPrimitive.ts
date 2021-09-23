import { ValidationFunc } from '../../@types'
import { isUndefined } from '../types'

export class AssertBoolean {
  private static instance: AssertBoolean

  private constructor () {}

  static getInstance (): AssertBoolean {
    if (isUndefined(AssertBoolean.instance)) AssertBoolean.instance = new AssertBoolean()
    return AssertBoolean.instance
  }

  optimize (schema): ValidationFunc[] {
    if (schema.type !== 'boolean') return []

    return [value => {
      if (typeof value !== 'boolean') return `#type: ${typeof value} is not a boolean`
    }]
  }
}

export class AssertNull {
  private static instance: AssertNull

  private constructor () { }

  static getInstance (): AssertNull {
    if (isUndefined(AssertNull.instance)) AssertNull.instance = new AssertNull()
    return AssertNull.instance
  }

  optimize (schema): ValidationFunc[] {
    if (schema.type !== 'null') return []

    return [value => {
      if (value !== null) return `#type: ${typeof value} is not null`
    }]
  }
}

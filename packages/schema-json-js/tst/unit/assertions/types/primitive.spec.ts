/* eslint-env jest */
import * as primitive from '../../../../src/assertions/types/primitive'

describe('primitive assertions', () => {
  it('should test array types successfully', () => {
    expect(primitive.isArray([])).toBe(true)
    expect(primitive.isArray(null)).toBe(false)
  })

  it('should test boolean types successfully', () => {
    expect(primitive.isBoolean(false)).toBe(true)
    expect(primitive.isBoolean(null)).toBe(false)
  })

  it('should test function types successfully', () => {
    expect(primitive.isFunction(() => {})).toBe(true)
    expect(primitive.isFunction(async () => {})).toBe(true)
    expect(primitive.isFunction(function () {})).toBe(true)
    expect(primitive.isFunction(function name () {})).toBe(true)
    expect(primitive.isFunction(null)).toBe(false)
  })

  it('should test integer types successfully', () => {
    expect(primitive.isInteger(1)).toBe(true)
    expect(primitive.isInteger(2)).toBe(true)
    expect(primitive.isInteger(1.1)).toBe(false)
    expect(primitive.isInteger(null)).toBe(false)
  })

  it('should test number types successfully', () => {
    expect(primitive.isNumber(1)).toBe(true)
    expect(primitive.isNumber(2)).toBe(true)
    expect(primitive.isNumber(1.1)).toBe(true)
    expect(primitive.isNumber(null)).toBe(false)
  })

  it('should test object types successfully', () => {
    expect(primitive.isObject({})).toBe(true)
    expect(primitive.isObject({ simple: 'object' })).toBe(true)
    expect(primitive.isObject(null)).toBe(false)
    expect(primitive.isObject([])).toBe(false)
  })

  it('should test string types successfully', () => {
    expect(primitive.isString('')).toBe(true)
    expect(primitive.isString('something')).toBe(true)
    expect(primitive.isString('\uD83D\uDCA9')).toBe(true)
    expect(primitive.isString(null)).toBe(false)
  })

  it('should test undefined types successfully', () => {
    expect(primitive.isUndefined(undefined)).toBe(true)
    expect(primitive.isUndefined(null)).toBe(false)
  })
})

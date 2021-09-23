/* eslint-env jest */
import * as complex from '../../../../src/assertions/types/complex'
import { isNumber } from '../../../../src/assertions/types'

describe('primitive assertions', () => {
  it('should test complex objects successfully', () => {
    expect(complex.deepEqual([], [])).toBe(true)
    expect(complex.deepEqual([1, 2, 3, 4], [1, 2, 3, 4])).toBe(true)
    expect(complex.deepEqual(null, [])).toBe(false)
    expect(complex.deepEqual([1, 2, 3, 4, 5], [1, 2, 3, 4])).toBe(false)
    expect(complex.deepEqual([1, 2, 3, 4], [1, 2, 3, 4, 5])).toBe(false)
    expect(complex.deepEqual([1, 2, 3, 4, 6], [1, 2, 3, 4, 5])).toBe(false)

    expect(complex.deepEqual({}, {})).toBe(true)
    expect(complex.deepEqual({ one: 1, two: 2 }, { one: 1, two: 2 })).toBe(true)
    expect(complex.deepEqual(null, {})).toBe(false)
    expect(complex.deepEqual({ one: 1, two: 2 }, { one: 1, two: 2, three: 3 })).toBe(false)
    expect(complex.deepEqual({ one: 1, two: 2, three: 3 }, { one: 1, two: 2 })).toBe(false)
    expect(complex.deepEqual({ one: 1, two: 3 }, { one: 1, two: 2 })).toBe(false)

    expect(complex.deepEqual('1', '1')).toBe(true)
    expect(complex.deepEqual(1, 0)).toBe(false)
    expect(complex.deepEqual(1, '1')).toBe(false)
  })

  it('should test enums successfully', () => {
    expect(complex.isEnum([1])).toBe(true)
    expect(complex.isEnum([1, 2])).toBe(true)
    expect(complex.isEnum([1, '2'])).toBe(true)
    expect(complex.isEnum([1, { two: 2 }])).toBe(true)
    expect(complex.isEnum([])).toBe(false)
    expect(complex.isEnum([1, 1])).toBe(false)
    expect(complex.isEnum([{ one: 1 }, { one: 1 }])).toBe(false)

    expect(complex.isEnum([1], isNumber)).toBe(true)
    expect(complex.isEnum([1, 2], isNumber)).toBe(true)
    expect(complex.isEnum([1, '2'], isNumber)).toBe(false)
    expect(complex.isEnum([1, { two: 2 }], isNumber)).toBe(false)
    expect(complex.isEnum([1, 1], isNumber)).toBe(false)
    expect(complex.isEnum([{ one: 1 }, { one: 1 }], isNumber)).toBe(false)
  })

  it('should test for parent keywords successfully', () => {
    expect(complex.isParentKeyword(['properties'])).toBe(true)
    expect(complex.isParentKeyword(['patternProperties'])).toBe(true)
    expect(complex.isParentKeyword(['dependencies'])).toBe(true)
    expect(complex.isParentKeyword(['const'])).toBe(true)
    expect(complex.isParentKeyword(['a', 'longer', 'path', 'to', 'const'])).toBe(true)
    expect(complex.isParentKeyword(['enum'])).toBe(true)
    expect(complex.isParentKeyword(['a', 'longer', 'path', 'to', 'enum'])).toBe(true)
    expect(complex.isParentKeyword([])).toBe(false)
    expect(complex.isParentKeyword(['something', 'else'])).toBe(false)
    expect(complex.isParentKeyword(['properties', 'fail'])).toBe(false)
  })

  it('should test for path fragments successfully', () => {
    expect(complex.isPathFragment('folder/')).toBe(true)
    expect(complex.isPathFragment('folder')).toBe(false)
  })

  it('should test for refs successfully', () => {
    expect(complex.isRef('http://localhost:1234/node#something').length).toBeTruthy()
    expect(complex.isRef('http://localhos~t:1234/node#something').length).toBeFalsy()
  })

  it('should test for Schemas successfully', () => {
    expect(complex.isSchema({})).toBe(true)
    expect(complex.isSchema(true)).toBe(true)
    expect(complex.isSchema(false)).toBe(true)
  })

  it('should test for valid schema types successfully', () => {
    expect(complex.isSchemaType('array')).toBe(true)
    expect(complex.isSchemaType('boolean')).toBe(true)
    expect(complex.isSchemaType('integer')).toBe(true)
    expect(complex.isSchemaType('null')).toBe(true)
    expect(complex.isSchemaType('number')).toBe(true)
    expect(complex.isSchemaType('object')).toBe(true)
    expect(complex.isSchemaType('string')).toBe(true)
    expect(complex.isSchemaType('something else')).toBe(false)
  })

  it('should test for nested schema definitions', () => {
    expect(complex.isSubSchema('http://test.com/v1/schema', ['definitions', 'schema'])).toBe(true)
    expect(complex.isSubSchema('http://test.com/v1/schema', ['properties', 'schema'])).toBe(false)
    expect(complex.isSubSchema('http://te~st.com/v1/schema', ['definitions', 'schema'])).toBe(false)
    expect(complex.isSubSchema('schema', ['definitions', 'schema'])).toBe(false)
  })

  it('should test for typed arrays', () => {
    expect(complex.isTypedArray([1, 2, 3, 4], isNumber)).toBe(true)
    expect(complex.isTypedArray([1, '2', 3, 4], isNumber)).toBe(false)
    expect(complex.isTypedArray([1, 2, 3, '4'], isNumber)).toBe(false)
  })
})

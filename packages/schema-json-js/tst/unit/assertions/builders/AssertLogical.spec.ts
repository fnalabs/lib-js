/* eslint-env jest */
import AssertArray from '../../../../src/assertions/builders/AssertArray'
import AssertLogical from '../../../../src/assertions/builders/AssertLogical'
import { OPTIMIZED } from '../../../../src/assertions/types'
import { assertOptimized } from '../../../utils'

describe('AssertLogical', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('optimizeAllOf', () => {
    describe('object JSON schemas', () => {
      const schema = {
        allOf: [
          { type: 'array', [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array' }).pop() },
          { minItems: 1, [OPTIMIZED]: AssertArray.getInstance().optimize({ minItems: 1 }).pop() }
        ]
      }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeAllOf(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized(['something'], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized([], schema, assertions)
        expect(error).toBe('#minItems: value minimum not met')

        error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#type: value is not an array')
      })

      it('should throw an error on invalid type', () => {
        try {
          assertions = AssertLogical.getInstance().optimizeAllOf({ allOf: null })
        } catch (e: any) {
          expect(e.message).toBe('#allOf: keyword should be an array of JSON Schemas')
        }

        try {
          assertions = AssertLogical.getInstance().optimizeAllOf({ allOf: [null] })
        } catch (e: any) {
          expect(e.message).toBe('#allOf: keyword should be an array of JSON Schemas')
        }
      })
    })

    describe('boolean JSON schemas', () => {
      const schema = {
        allOf: [
          { type: 'array', [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array' }).pop() },
          false
        ]
      }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeAllOf(schema)))

      it('should assert optimized with invalid values unsuccessfully', () => {
        const error = assertOptimized([], schema, assertions)
        expect(error).toBe('#allOf: \'false\' JSON Schema invalidates all values')
      })
    })
  })

  describe('optimizeAnyOf', () => {
    describe('object JSON schemas', () => {
      const schema = {
        anyOf: [
          { type: 'array', maxItems: 1, [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array', maxItems: 3 }).pop() },
          { type: 'array', minItems: 1, [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array', minItems: 1 }).pop() }
        ]
      }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeAnyOf(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([], schema, assertions)).toBe(undefined)
        expect(assertOptimized(['something'], schema, assertions)).toBe(undefined)
        expect(assertOptimized(['something', 'something'], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#anyOf: none of the defined JSON Schemas match the value')
      })
    })

    describe('boolean JSON schemas', () => {
      const schema = { anyOf: [true, false] }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeAnyOf(schema)))

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([null], schema, assertions)).toBe(undefined)
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.getInstance().optimizeAnyOf({ anyOf: null })
      } catch (e: any) {
        expect(e.message).toBe('#anyOf: keyword should be an array of JSON Schemas')
      }

      try {
        assertions = AssertLogical.getInstance().optimizeAnyOf({ anyOf: [null] })
      } catch (e: any) {
        expect(e.message).toBe('#anyOf: keyword should be an array of JSON Schemas')
      }
    })
  })

  describe('optimizeNot', () => {
    describe('object JSON schema', () => {
      const schema = { not: { type: 'array', [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array' }).pop() } }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeNot(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([], schema, assertions)
        expect(error).toBe('#not: value validated successfully against the schema')
      })
    })

    describe('boolean JSON schemas', () => {
      const schema = { not: false }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeNot(schema)))

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.getInstance().optimizeNot({ not: null })
      } catch (e: any) {
        expect(e.message).toBe('#not: keyword should be a JSON Schema')
      }
    })
  })

  describe('optimizeOneOf', () => {
    describe('object JSON schemas', () => {
      const schema = {
        oneOf: [
          { type: 'array', minItems: 1, maxItems: 3, [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array', minItems: 1, maxItems: 3 }).pop() },
          { type: 'array', minItems: 3, [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array', minItems: 1 }).pop() }
        ]
      }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeOneOf(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(['something'], schema, assertions)).toBe(undefined)
        expect(assertOptimized(['something', 'something'], schema, assertions)).toBe(undefined)
        expect(assertOptimized(['something', 'something', 'something', 'something'], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized([], schema, assertions)
        expect(error).toBe('#oneOf: value should match only one of the listed schemas')

        error = assertOptimized(['something', 'something', 'something'], schema, assertions)
        expect(error).toBe('#oneOf: value should match only one of the listed schemas')

        error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#oneOf: value should match only one of the listed schemas')
      })
    })

    describe('boolean JSON schemas', () => {
      const schema = {
        oneOf: [
          { type: 'array', minItems: 1, maxItems: 3, [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array', minItems: 1, maxItems: 3 }).pop() },
          true,
          false
        ]
      }

      beforeEach(() => (assertions = AssertLogical.getInstance().optimizeOneOf(schema)))

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertLogical.getInstance().optimizeOneOf({ oneOf: null })
      } catch (e: any) {
        expect(e.message).toBe('#oneOf: keyword should be an array of JSON Schemas')
      }

      try {
        assertions = AssertLogical.getInstance().optimizeOneOf({ oneOf: [null] })
      } catch (e: any) {
        expect(e.message).toBe('#oneOf: keyword should be an array of JSON Schemas')
      }
    })
  })
})

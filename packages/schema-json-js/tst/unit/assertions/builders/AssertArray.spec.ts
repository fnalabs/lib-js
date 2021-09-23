/* eslint-env jest */
import AssertArray from '../../../../src/assertions/builders/AssertArray'
import { OPTIMIZED } from '../../../../src/assertions/types'
import { assertOptimized } from '../../../utils'

describe('AssertArray', () => {
  const typeSchema = { type: 'array', [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array' }).pop() }
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    const schema = { type: 'array' }

    beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized([], schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(null, schema, assertions)
      expect(error).toBe('#type: value is not an array')
    })
  })

  describe('items keyword', () => {
    describe('as a schema', () => {
      const schema = { items: typeSchema }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized([[]], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([null], schema, assertions)
        expect(error).toBe('#type: value is not an array')
      })
    })

    describe('as an array of schemas', () => {
      const schema = { items: [typeSchema, typeSchema, false] }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([[]], schema, assertions)).toBe(undefined)
        expect(assertOptimized([[], []], schema, assertions)).toBe(undefined)
        expect(assertOptimized([[], [], []], schema, assertions)).not.toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([null, null], schema, assertions)
        expect(error).toBe('#type: value is not an array')
      })
    })

    describe('as a boolean schema', () => {
      const schema = { items: false }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([true, true], schema, assertions)
        expect(error).toBe('#items: \'false\' JSON Schema invalidates all values')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.getInstance().optimize({ items: null })
      } catch (e: any) {
        expect(e.message).toBe('#items: must be either a JSON Schema or an array of JSON Schemas')
      }
    })
  })

  describe('additionalItems keyword', () => {
    describe('as a boolean', () => {
      const schema = { items: [typeSchema], additionalItems: false }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([[]], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([[], []], schema, assertions)
        expect(error).toBe('#additionalItems: \'1\' additional items not allowed')
      })
    })

    describe('as a schema', () => {
      const schema = { items: [typeSchema], additionalItems: typeSchema }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([[]], schema, assertions)).toBe(undefined)
        expect(assertOptimized([[], []], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized([[], null], schema, assertions)
        expect(error).toBe('#type: value is not an array')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.getInstance().optimize({ items: [{}], additionalItems: null })
      } catch (e: any) {
        expect(e.message).toBe('#additionalItems: must be either a JSON Schema or boolean if defined')
      }
    })
  })

  describe('contains keyword', () => {
    describe('as an object schema', () => {
      const schema = { contains: typeSchema }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([1, []], schema, assertions)).toBe(undefined)
        expect(assertOptimized([[], 2], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized([1, 2], schema, assertions)
        expect(error).toBe('#contains: value does not contain element matching the schema')

        error = assertOptimized([], schema, assertions)
        expect(error).toBe('#contains: value does not contain element matching the schema')
      })

      it('should throw an error on invalid type', () => {
        try {
          assertions = AssertArray.getInstance().optimize({ contains: null })
        } catch (e: any) {
          expect(e.message).toBe('#contains: keyword should be a JSON Schema')
        }
      })
    })

    describe('as a boolean schema', () => {
      const schema = { contains: false }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        let error = assertOptimized([], schema, assertions)
        expect(error).toBe('#contains: value does not contain element matching the schema')

        error = assertOptimized([1, 2, 3], schema, assertions)
        expect(error).toBe('#contains: value does not contain element matching the schema')
      })
    })
  })

  describe('maxItems keyword', () => {
    const schema = { maxItems: 1 }

    beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized([], schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized([1, 2], schema, assertions)
      expect(error).toBe('#maxItems: value maximum exceeded')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.getInstance().optimize({ maxItems: null })
      } catch (e: any) {
        expect(e.message).toBe('#maxItems: keyword must be a positive integer')
      }
    })
  })

  describe('minItems keyword', () => {
    const schema = { minItems: 1 }

    beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized([1], schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized([], schema, assertions)
      expect(error).toBe('#minItems: value minimum not met')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.getInstance().optimize({ minItems: null })
      } catch (e: any) {
        expect(e.message).toBe('#minItems: keyword must be a positive integer')
      }
    })
  })

  describe('uniqueItems keyword', () => {
    const schema = { uniqueItems: true }

    beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid primitive values successfully', () => {
      expect(assertOptimized([1, 2], schema, assertions)).toBe(undefined)
      expect(assertOptimized([schema, 1], schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid primitive values unsuccessfully', () => {
      let error = assertOptimized([1, 1], schema, assertions)
      expect(error).toBe('#uniqueItems: value does not contain unique items')

      error = assertOptimized([schema, schema], schema, assertions)
      expect(error).toBe('#uniqueItems: value does not contain unique items')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertArray.getInstance().optimize({ uniqueItems: null })
      } catch (e: any) {
        expect(e.message).toBe('#minItems: keyword must be a positive integer')
      }
    })
  })

  describe('complex array schemas', () => {
    describe('with enforced type', () => {
      const schema = { type: 'array', maxItems: 3, minItems: 1 }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized([1], schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#type: value is not an array')
      })
    })

    describe('without enforced type', () => {
      const schema = { maxItems: 3, minItems: 1 }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized([1], schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })
    })

    describe('with iterative validations', () => {
      const schema = { type: 'array', items: { type: 'number', [OPTIMIZED]: AssertArray.getInstance().optimize({ type: 'array' }).pop() }, maxItems: 3, minItems: 1 }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should create optimized assertions and validate successfully', () => {
        expect(assertOptimized([[]], schema, assertions)).toBe(undefined)
        expect(assertOptimized([[], []], schema, assertions)).toBe(undefined)
        expect(assertOptimized([[], [], []], schema, assertions)).toBe(undefined)
      })

      it('should create optimized assertions and validate unsuccessfully', () => {
        let error = assertOptimized([], schema, assertions)
        expect(error).toBe('#minItems: value minimum not met')

        error = assertOptimized([[], [], [], []], schema, assertions)
        expect(error).toBe('#maxItems: value maximum exceeded')
      })
    })

    describe('without a type defined', () => {
      const schema = { items: { type: 'number' }, maxItems: 3, minItems: 1 }

      beforeEach(() => (assertions = AssertArray.getInstance().optimize(schema)))

      it('should ignore non-array types', () => {
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })
    })
  })
})

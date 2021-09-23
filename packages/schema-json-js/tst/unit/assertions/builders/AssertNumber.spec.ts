/* eslint-env jest */
import AssertNumber from '../../../../src/assertions/builders/AssertNumber'
import { assertOptimized } from '../../../utils'

describe('AssertNumber', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    describe('as integer', () => {
      const schema = { type: 'integer' }

      beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized(1, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized(1.1, schema, assertions)
        expect(error).toBe('#type: value is not an integer')

        error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#type: value is not an integer')
      })
    })

    describe('as number', () => {
      const schema = { type: 'number' }

      beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(1, schema, assertions)).toBe(undefined)
        expect(assertOptimized(1.1, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value type unsuccessfully', () => {
        try {
          assertOptimized(null, schema, assertions)
        } catch (e: any) {
          expect(e.message).toBe('#type: value is not a(n) number')
        }
      })
    })
  })

  describe('maximum keyword', () => {
    const schema = { maximum: 1 }

    beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized(0, schema, assertions)).toBe(undefined)
      expect(assertOptimized(1, schema, assertions)).toBe(undefined)
      expect(assertOptimized(null, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(2, schema, assertions)
      expect(error).toBe('#maximum: 2 is greater than or equal to 1')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.getInstance().optimize({ maximum: null })
      } catch (e: any) {
        expect(e.message).toBe('#maximum: keyword is not the right type')
      }
    })
  })

  describe('exclusiveMaximum keyword', () => {
    describe('as a number', () => {
      const schema = { exclusiveMaximum: 1 }

      beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(0, schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(1, schema, assertions)
        expect(error).toBe('#exclusiveMaximum: 1 is greater than or equal to 1')
      })
    })

    describe('as a boolean', () => {
      const schema = { maximum: 1, exclusiveMaximum: true }

      beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(0, schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(1, schema, assertions)
        expect(error).toBe('#maximum: 1 is greater than or equal to 1')
      })
    })

    it('should create optimized assertions successfully if both are numbers', () => {
      assertions = AssertNumber.getInstance().optimize({ maximum: 1, exclusiveMaximum: 1 })

      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.getInstance().optimize({ maximum: 1, exclusiveMaximum: null })
      } catch (e: any) {
        expect(e.message).toBe('#exclusiveMaximum: keyword is not a boolean')
      }
    })
  })

  describe('minimum keyword', () => {
    const schema = { minimum: 1 }

    beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized(1, schema, assertions)).toBe(undefined)
      expect(assertOptimized(2, schema, assertions)).toBe(undefined)
      expect(assertOptimized(null, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(0, schema, assertions)
      expect(error).toBe('#minimum: 0 is less than or equal to 1')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.getInstance().optimize({ minimum: null })
      } catch (e: any) {
        expect(e.message).toBe('#minimum: keyword is not the right type')
      }
    })
  })

  describe('exclusiveMinimum keyword', () => {
    describe('as a number', () => {
      const schema = { exclusiveMinimum: 1 }

      beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(2, schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(1, schema, assertions)
        expect(error).toBe('#exclusiveMinimum: 1 is less than or equal to 1')
      })
    })

    describe('as a boolean', () => {
      const schema = { minimum: 1, exclusiveMinimum: true }

      beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized(2, schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(1, schema, assertions)
        expect(error).toBe('#minimum: 1 is less than or equal to 1')
      })
    })

    it('should create optimized assertions successfully if both are numbers', () => {
      assertions = AssertNumber.getInstance().optimize({ minimum: 1, exclusiveMinimum: 1 })

      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.getInstance().optimize({ minimum: 1, exclusiveMinimum: null })
      } catch (e: any) {
        expect(e.message).toBe('#exclusiveMinimum: keyword is not a boolean')
      }
    })
  })

  describe('multipleOf keyword', () => {
    const schema = { multipleOf: 2 }

    beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized(4, schema, assertions)).toBe(undefined)
      expect(assertOptimized(null, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(3, schema, assertions)
      expect(error).toBe('#multipleOf: 3 is not a multiple of 2')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertNumber.getInstance().optimize({ multipleOf: null })
      } catch (e: any) {
        expect(e.message).toBe('#multipleOf: keyword is not the right type')
      }
    })
  })

  describe('complex number schemas', () => {
    const schema = { type: 'number', maximum: 1 }

    beforeEach(() => (assertions = AssertNumber.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized(0, schema, assertions)).toBe(undefined)
      expect(assertOptimized(1, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      let error = assertOptimized(2, schema, assertions)
      expect(error).toBe('#maximum: 2 is greater than or equal to 1')

      error = assertOptimized(null, schema, assertions)
      expect(error).toBe('#type: value is not a(n) number')
    })
  })
})

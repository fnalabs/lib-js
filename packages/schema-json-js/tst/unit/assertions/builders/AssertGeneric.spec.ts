/* eslint-env jest */
import AssertGeneric from '../../../../src/assertions/builders/AssertGeneric'
import { assertOptimized } from '../../../utils'

describe('AssertGeneric', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('const keyword', () => {
    describe('as a primitive', () => {
      const schema = { const: 1 }

      beforeEach(() => (assertions = AssertGeneric.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized(1, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized(2, schema, assertions)
        expect(error).toBe('#const: value does not match the defined const')

        error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#const: value does not match the defined const')
      })
    })

    describe('as a complex object', () => {
      const schema = { const: { complex: 'object' } }

      beforeEach(() => (assertions = AssertGeneric.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ complex: 'object' }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized({ another: 'object' }, schema, assertions)
        expect(error).toBe('#const: value does not match the defined const')

        error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#const: value does not match the defined const')
      })
    })
  })

  describe('enum keyword', () => {
    const schema = { enum: [1, { complex: 'object' }] }

    beforeEach(() => (assertions = AssertGeneric.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized(1, schema, assertions)).toBe(undefined)
      expect(assertOptimized({ complex: 'object' }, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      let error = assertOptimized({ another: 'object' }, schema, assertions)
      expect(error).toBe('#enum: value does not match anything in the enum')

      error = assertOptimized(null, schema, assertions)
      expect(error).toBe('#enum: value does not match anything in the enum')
    })

    it('should throw an error on invalid enum', () => {
      try {
        assertions = AssertGeneric.getInstance().optimize({ enum: null })
      } catch (e: any) {
        expect(e.message).toBe('#enum: invalid enum, check format and for duplicates')
      }
    })
  })
})

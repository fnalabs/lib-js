/* eslint-env jest */
import AssertObject from '../../../../src/assertions/builders/AssertObject'
import AssertString from '../../../../src/assertions/builders/AssertString'
import { OPTIMIZED } from '../../../../src/assertions/types'
import { assertOptimized } from '../../../utils'

describe('AssertObject', () => {
  const typeSchema = { type: 'object', maxProperties: 2, [OPTIMIZED]: AssertObject.getInstance().optimize({ type: 'object', maxProperties: 1 }).pop() }
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    const schema = { type: 'object' }

    beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized({}, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(null, schema, assertions)
      expect(error).toBe('#type: value is not an object')
    })
  })

  describe('properties keyword', () => {
    describe('with standard schemas', () => {
      const schema = { properties: { property: typeSchema } }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ property: null }, schema, assertions)
        expect(error).toBe('#type: value is not an object')
      })
    })

    describe('with boolean schemas', () => {
      const schema = { properties: { foo: true, bar: false } }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({}, schema, assertions)).toBe(undefined)
        expect(assertOptimized({ foo: 1 }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized({ bar: 2 }, schema, assertions)
        expect(error).toBe('#properties: \'false\' JSON Schema invalidates all values')

        error = assertOptimized({ foo: 1, bar: 2 }, schema, assertions)
        expect(error).toBe('#properties: \'false\' JSON Schema invalidates all values')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ properties: null })
      } catch (e: any) {
        expect(e.message).toBe('#properties: must be an object')
      }
    })
  })

  describe('patternProperties keyword', () => {
    const schema = { patternProperties: { '^p': typeSchema, '^q': false } }

    beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized({ property: {} }, schema, assertions)).toBe(undefined)
      expect(assertOptimized({ pattern: {}, property: {} }, schema, assertions)).toBe(undefined)
      expect(assertOptimized({ pattern: {}, property: {}, with_ignored: true }, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      let error = assertOptimized({ pattern: null, property: null }, schema, assertions)
      expect(error).toBe('#type: value is not an object')

      error = assertOptimized({ pattern: null, property: null }, schema, assertions)
      expect(error).toBe('#type: value is not an object')

      error = assertOptimized({ query: 'not gonna allow this shit' }, schema, assertions)
      expect(error).toBe('#patternProperties: \'false\' JSON Schema invalidates all values')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ patternProperties: null })
      } catch (e: any) {
        expect(e.message).toBe('#patternProperties: must be an object')
      }
    })
  })

  describe('additionalProperties keyword', () => {
    describe('as a boolean', () => {
      const schema = { properties: { property: typeSchema }, additionalProperties: false }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ additional: {}, property: {} }, schema, assertions)
        expect(error).toBe('#additionalProperties: additional properties not allowed')
      })
    })

    describe('as a schema', () => {
      const schema = { properties: { property: typeSchema }, additionalProperties: typeSchema }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).toBe(undefined)
        expect(assertOptimized({ additional: {}, property: {} }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ additional: null, property: {} }, schema, assertions)
        expect(error).toBe('#type: value is not an object')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ properties: { property: typeSchema }, additionalProperties: null })
      } catch (e: any) {
        expect(e.message).toBe('#additionalProperties: must be either a JSON Schema or boolean')
      }
    })
  })

  describe('dependencies keyword', () => {
    describe('as an array', () => {
      const schema = { dependencies: { foo: ['bar'], be: false } }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ bar: 'anything' }, schema, assertions)).toBe(undefined)
        expect(assertOptimized({ foo: 'bar', bar: 'foo' }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        let error = assertOptimized({ foo: 'bar' }, schema, assertions)
        expect(error).toBe('#dependencies: value does not have \'foo\' dependency')

        error = assertOptimized({ be: 'something' }, schema, assertions)
        expect(error).toBe('#dependencies: \'false\' JSON Schema invalidates all values')
      })
    })

    describe('as a Schema', () => {
      const schema = { dependencies: { foo: typeSchema } }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ bar: 'anything' }, schema, assertions)).toBe(undefined)
        expect(assertOptimized({ foo: 'bar', bar: 'foo' }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ foo: 'bar', bar: 'foo', one: 'more' }, schema, assertions)
        expect(error).toBe('#maxProperties: value maximum exceeded')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ dependencies: { foo: null } })
      } catch (e: any) {
        expect(e.message).toBe('#dependencies: all dependencies must either be JSON Schemas|enums')
      }
    })
  })

  describe('propertyNames keyword', () => {
    describe('object JSON schema', () => {
      const schema = { propertyNames: { minLength: 2, [OPTIMIZED]: AssertString.getInstance().optimize({ minLength: 2 }).pop() } }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ property: {} }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ p: {} }, schema, assertions)
        expect(error).toBe('#minLength: value minimum not met')
      })
    })

    describe('boolean JSON schema', () => {
      const schema = { propertyNames: false }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ p: {} }, schema, assertions)
        expect(error).toBe('#propertyNames: \'false\' JSON Schema invalidates all values')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ propertyNames: null })
      } catch (e: any) {
        expect(e.message).toBe('#propertyNames: must be a JSON Schema')
      }
    })
  })

  describe('required keyword', () => {
    const schema = { required: ['foo'] }

    beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized({ foo: 1 }, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized({ one: 1 }, schema, assertions)
      expect(error).toBe('#required: value does not have all required properties')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ required: null })
      } catch (e: any) {
        expect(e.message).toBe('#required: required properties must be defined in an array of strings')
      }
    })
  })

  describe('maxProperties keyword', () => {
    const schema = { maxProperties: 1 }

    beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized({}, schema, assertions)).toBe(undefined)
      expect(assertOptimized({ one: 1 }, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized({ one: 1, two: 2 }, schema, assertions)
      expect(error).toBe('#maxProperties: value maximum exceeded')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ maxProperties: null })
      } catch (e: any) {
        expect(e.message).toBe('#maxProperties: keyword must be a positive integer')
      }
    })
  })

  describe('minProperties keyword', () => {
    const schema = { minProperties: 1 }

    beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized({ one: 1 }, schema, assertions)).toBe(undefined)
      expect(assertOptimized({ one: 1, two: 2 }, schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized({}, schema, assertions)
      expect(error).toBe('#minProperties: value minimum not met')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertObject.getInstance().optimize({ minProperties: null })
      } catch (e: any) {
        expect(e.message).toBe('#minProperties: keyword must be a positive integer')
      }
    })
  })

  describe('complex object schemas', () => {
    describe('with type defined', () => {
      const schema = { type: 'object', maxProperties: 1, [OPTIMIZED]: AssertObject.getInstance().optimize({ type: 'object', maxProperties: 1 }).pop() }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized({ one: 1 }, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid values unsuccessfully', () => {
        let error = assertOptimized({ one: 1, two: 2 }, schema, assertions)
        expect(error).toBe('#maxProperties: value maximum exceeded')

        error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#type: value is not an object')
      })
    })

    describe('without enforced type', () => {
      const schema = { maxProperties: 1, [OPTIMIZED]: AssertObject.getInstance().optimize({ maxProperties: 1 }).pop() }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized({ one: 1 }, schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized({ one: 1, two: 2 }, schema, assertions)
        expect(error).toBe('#maxProperties: value maximum exceeded')
      })
    })

    describe('with iterative validations', () => {
      const schema = { type: 'object', additionalProperties: {}, maxProperties: 1, minProperties: 1 }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should create optimized assertions and validate successfully', () => {
        expect(assertOptimized({ anything: 'goes' }, schema, assertions)).toBe(undefined)
      })

      it('should create optimized assertions and validate unsuccessfully', () => {
        let error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#type: value is not an object')

        error = assertOptimized({}, schema, assertions)
        expect(error).toBe('#minProperties: value minimum not met')

        error = assertOptimized({ not: 'always', anything: 'goes' }, schema, assertions)
        expect(error).toBe('#maxProperties: value maximum exceeded')
      })
    })

    describe('without a type defined', () => {
      const schema = { additionalProperties: {}, maxProperties: 1, minProperties: 1 }

      beforeEach(() => (assertions = AssertObject.getInstance().optimize(schema)))

      it('should ignore non-object types', () => {
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })
    })
  })
})

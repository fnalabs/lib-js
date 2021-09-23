/* eslint-env jest */
import AssertString from '../../../../src/assertions/builders/AssertString'
import { assertOptimized } from '../../../utils'

describe('AssertString', () => {
  let assertions

  afterEach(() => {
    assertions = null
  })

  describe('type keyword', () => {
    const schema = { type: 'string' }

    beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized('', schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized(null, schema, assertions)
      expect(error).toBe('#type: value is not a string')
    })
  })

  describe('format keyword', () => {
    describe('as date-time', () => {
      const schema = { format: 'date-time' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('1963-06-19T08:30:06.283185Z', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('06/19/1963 08:30:06 PST', schema, assertions)
        expect(error).toBe('#format: value does not match "date-time" format')
      })
    })

    describe('as email', () => {
      const schema = { format: 'email' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('joe.bloggs@example.com', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('2962', schema, assertions)
        expect(error).toBe('#format: value does not match "email" format')
      })
    })

    describe('as ipv4', () => {
      const schema = { format: 'ipv4' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('192.168.0.1', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('127.0', schema, assertions)
        expect(error).toBe('#format: value does not match "ipv4" format')
      })
    })

    describe('as ipv6', () => {
      const schema = { format: 'ipv6' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('::1', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('12345::', schema, assertions)
        expect(error).toBe('#format: value does not match "ipv6" format')
      })
    })

    describe('as hostname', () => {
      const schema = { format: 'hostname' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('www.example.com', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('-a-host-name-that-starts-with--', schema, assertions)
        expect(error).toBe('#format: value does not match "hostname" format')
      })
    })

    describe('as json-pointer', () => {
      const schema = { format: 'json-pointer' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('/foo/bar~0/baz~1/%a', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('/foo/bar~', schema, assertions)
        expect(error).toBe('#format: value does not match "json-pointer" format')
      })
    })

    describe('as regex', () => {
      const schema = { format: 'regex' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('^a', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        let error = assertOptimized('[', schema, assertions)
        expect(error).toBe('#format: value is not a valid "regex" format')

        error = assertOptimized('^\\S(|(.|\\n)*\\S)\\Z', schema, assertions)
        expect(error).toBe('#format: ECMA 262 has no support for \\Z anchor from .NET')
      })
    })

    describe('as uri', () => {
      const schema = { format: 'uri' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('http://foo.bar/?baz=qux#quux', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('//foo.bar/?baz=qux#quux', schema, assertions)
        expect(error).toBe('#format: value does not match "uri" format')
      })
    })

    describe('as uri-reference', () => {
      const schema = { format: 'uri-reference' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('/abc', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('\\\\WINDOWS\\fileshare', schema, assertions)
        expect(error).toBe('#format: value does not match "uri-reference" format')
      })
    })

    describe('as uri-template', () => {
      const schema = { format: 'uri-template' }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('http://example.com/dictionary/{term:1}/{term}', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized('http://example.com/dictionary/{term:1}/{term', schema, assertions)
        expect(error).toBe('#format: value does not match "uri-template" format')
      })
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.getInstance().optimize({ format: null })
      } catch (e: any) {
        expect(e.message).toBe('#format: keyword is not a string')
      }

      try {
        assertions = AssertString.getInstance().optimize({ format: 'string' })
      } catch (e: any) {
        expect(e.message).toBe('#format: \'string\' is not supported')
      }
    })
  })

  describe('maxLength keyword', () => {
    const schema = { maxLength: 2 }

    beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized('', schema, assertions)).toBe(undefined)
      expect(assertOptimized('1', schema, assertions)).toBe(undefined)
      expect(assertOptimized('12', schema, assertions)).toBe(undefined)
      expect(assertOptimized('\uD83D\uDCA9', schema, assertions)).toBe(undefined)
      expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      let error = assertOptimized('123', schema, assertions)
      expect(error).toBe('#maxLength: value maximum exceeded')

      error = assertOptimized('\uD83D\uDCA9\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)
      expect(error).toBe('#maxLength: value maximum exceeded')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.getInstance().optimize({ maxLength: null })
      } catch (e: any) {
        expect(e.message).toBe('#maxLength: keyword must be a positive integer')
      }
    })
  })

  describe('minLength keyword', () => {
    const schema = { minLength: 2 }

    beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid values successfully', () => {
      expect(assertOptimized('12', schema, assertions)).toBe(undefined)
      expect(assertOptimized('123', schema, assertions)).toBe(undefined)
      expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).toBe(undefined)
      expect(assertOptimized('\uD83D\uDCA9\uD83D\uDCA9\uD83D\uDCA9', schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid values unsuccessfully', () => {
      let error = assertOptimized('1', schema, assertions)
      expect(error).toBe('#minLength: value minimum not met')

      error = assertOptimized('\uD83D\uDCA9', schema, assertions)
      expect(error).toBe('#minLength: value minimum not met')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.getInstance().optimize({ minLength: null })
      } catch (e: any) {
        expect(e.message).toBe('#minLength: keyword must be a positive integer')
      }
    })
  })

  describe('pattern keyword', () => {
    const schema = { pattern: '^a*$' }

    beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

    it('should create optimized assertions successfully', () => {
      expect(Array.isArray(assertions)).toBe(true)
      expect(assertions.length).toBe(1)
      expect(typeof assertions[0]).toBe('function')
    })

    it('should assert optimized with valid value successfully', () => {
      expect(assertOptimized('aaa', schema, assertions)).toBe(undefined)
    })

    it('should assert optimized with invalid value unsuccessfully', () => {
      const error = assertOptimized('abc', schema, assertions)
      expect(error).toBe('#pattern: value does not match pattern \'^a*$\'')
    })

    it('should throw an error on invalid type', () => {
      try {
        assertions = AssertString.getInstance().optimize({ pattern: null })
      } catch (e: any) {
        expect(e.message).toBe('#pattern: keyword is not a string')
      }
    })
  })

  describe('complex string schemas', () => {
    describe('with enforced type', () => {
      const schema = { type: 'string', maxLength: 2 }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid value successfully', () => {
        expect(assertOptimized('1', schema, assertions)).toBe(undefined)
      })

      it('should assert optimized with invalid value unsuccessfully', () => {
        const error = assertOptimized(null, schema, assertions)
        expect(error).toBe('#type: value is not a string')
      })
    })

    describe('without enforced type', () => {
      const schema = { maxLength: 2 }

      beforeEach(() => (assertions = AssertString.getInstance().optimize(schema)))

      it('should create optimized assertions successfully', () => {
        expect(Array.isArray(assertions)).toBe(true)
        expect(assertions.length).toBe(1)
        expect(typeof assertions[0]).toBe('function')
      })

      it('should assert optimized with valid values successfully', () => {
        expect(assertOptimized('1', schema, assertions)).toBe(undefined)
        expect(assertOptimized(null, schema, assertions)).toBe(undefined)
      })
    })
  })
})

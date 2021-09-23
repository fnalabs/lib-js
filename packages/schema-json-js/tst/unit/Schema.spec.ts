/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-env jest */
import nock from 'nock'

import Schema from '../../src/Schema'

import draft04Schema from '../refs/json-schema-draft-04.json'

describe('Schema', () => {
  const testSchema = { $id: 'http://json-schema.org/draft-04/schema', type: 'string' }
  let schema

  afterAll(() => {
    nock.enableNetConnect()
  })

  afterEach(() => (schema = null))

  beforeAll(() => (nock.disableNetConnect()))

  describe('constructor', () => {
    it('should create a Schema object successfully', async () => {
      schema = await new Schema()

      expect(typeof schema).toBe('object')
      expect(schema).toEqual({})
      expect(Object.isFrozen(schema)).toBe(false)

      expect(schema.errors).toEqual([])
      expect(typeof schema.assign).toBe('function')
      expect(typeof schema.validate).toBe('function')
    })

    it('should create a Schema object with async validation successfully', async () => {
      schema = await new Schema()

      expect(typeof schema).toBe('object')
      expect(schema).toEqual({})
      expect(Object.isFrozen(schema)).toBe(false)

      expect(schema.errors).toEqual([])
      expect(typeof schema.assign).toBe('function')
      expect(typeof schema.validate).toBe('function')

      schema = await new Schema({})

      expect(typeof schema).toBe('object')
      expect(schema).toEqual({})
      expect(Object.isFrozen(schema)).toBe(true)

      expect(schema.errors).toEqual([])
      expect(typeof schema.assign).toBe('function')
      expect(typeof schema.validate).toBe('function')

      schema = await new Schema({}, { 'http://json-schema.org/draft-04/schema': testSchema })

      expect(typeof schema).toBe('object')
      expect(schema).toEqual({})
      expect(Object.isFrozen(schema)).toBe(true)

      expect(schema.errors).toEqual([])
      expect(typeof schema.assign).toBe('function')
      expect(typeof schema.validate).toBe('function')

      expect(await schema.validate(true)).toBe(true)

      schema = await new Schema({ properties: { test: { type: 'string' }, another: { type: 'string' } } })

      expect(await schema.validate({ test: 'ing', another: 'object' })).toBe(true)
      expect(await schema.validate({ test: true, another: 'object' })).toBe(false)
    })
  })

  describe('#validate', () => {
    it('should validate a base schema ({}) successfully', async () => {
      schema = await new Schema()

      expect(schema).toEqual({})
      expect(Object.isFrozen(schema)).toBe(false)

      expect(schema.validateSync('anything')).toBe(true)
      expect(schema.validateSync(1)).toBe(true)
      expect(schema.validateSync(1.1)).toBe(true)
      expect(schema.validateSync(true)).toBe(true)
      expect(schema.validateSync(['an', 'array'])).toBe(true)
      expect(schema.validateSync({ an: 'object' })).toBe(true)
      expect(schema.validateSync(null)).toBe(true)

      expect(schema.validateSync(true, false)).toBe(false)
    })

    it('should validate a complex schema successfully', async () => {
      schema = await new Schema({ type: ['string', 'boolean'], minLength: 3 })

      expect(schema.validateSync(true)).toBe(true)
      expect(schema.validateSync(false)).toBe(true)
      expect(schema.validateSync('yes')).toBe(true)
      expect(schema.validateSync('no')).toBe(false)
    })
  })

  describe('#assign', () => {
    it('should assign a base schema and validate successfully', async () => {
      schema = await new Schema({})

      expect(schema).toEqual({})
      expect(Object.isFrozen(schema)).toBe(true)

      expect(schema.validateSync('anything')).toBe(true)
      expect(schema.validateSync(1)).toBe(true)
      expect(schema.validateSync(1.1)).toBe(true)
      expect(schema.validateSync(true)).toBe(true)
      expect(schema.validateSync(['an', 'array'])).toBe(true)
      expect(schema.validateSync({ an: 'object' })).toBe(true)
      expect(schema.validateSync(null)).toBe(true)
    })

    it('should assign properties that are objects successfully', async () => {
      const test = { properties: {} }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
      expect(Object.isFrozen(schema)).toBe(true)
      expect(Object.isFrozen(schema.properties)).toBe(true)
    })

    it('should assign properties that are arrays successfully', async () => {
      const test = { type: ['boolean', 'null'] }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
      expect(Object.isFrozen(schema)).toBe(true)
      expect(Object.isFrozen(schema.type)).toBe(true)

      expect(schema.validateSync(false)).toBe(true)
      expect(schema.validateSync(null)).toBe(true)
      expect(schema.validateSync('')).toBe(false)
    })

    it('should actually use assign explicitly...', async () => {
      const test = { type: ['boolean', 'null'] }

      schema = await new Schema()

      expect(schema).toEqual({})
      expect(schema).not.toEqual(test)
      expect(Object.isFrozen(schema)).toBe(false)
      expect(typeof schema.type === 'undefined').toBe(true)

      await schema.assign(test)

      expect(schema).toEqual(test)
      expect(Object.isFrozen(schema)).toBe(true)
      expect(Object.isFrozen(schema.type)).toBe(true)

      expect(schema.validateSync(false)).toBe(true)
      expect(schema.validateSync(null)).toBe(true)
      expect(schema.validateSync('')).toBe(false)
    })
  })

  describe('($)id|$ref keywords', () => {
    afterEach(() => {
      nock.cleanAll()

      if (typeof global.fetch !== 'undefined') jest.restoreAllMocks()
    })

    beforeEach(() => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, testSchema)

      if (typeof global.fetch !== 'undefined') {
        jest.spyOn(global, 'fetch').mockImplementation(async () => await Promise.resolve({ json: () => testSchema } as unknown as Response))
      }
    })

    it('should assign with simple definitions successfully', async () => {
      const test = { $ref: '#/definitions/test', definitions: { test: {} } }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
      expect(schema.validateSync('test')).toBe(true)
    })

    it('should assign with more complex definitions successfully', async () => {
      const test = { $ref: '#/definitions/test', definitions: { test: { type: ['string', 'null'], minLength: 2 } } }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
      expect(schema.validateSync('test')).toBe(true)
      expect(schema.validateSync('a')).toBe(false)
    })

    it('should assign with even more complex definitions successfully', async () => {
      const test = { $ref: '#/definitions/test', definitions: { test: { $ref: '#/definitions/anything' }, anything: {} } }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
      expect(schema.validateSync('test')).toBe(true)
    })

    it('should assign refs from remote sources successfully', async () => {
      const test = { $ref: 'http://json-schema.org/draft-04/schema' }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
    })

    it('should assign with cached ref for recursive schemas successfully', async () => {
      schema = await new Schema(testSchema)

      expect(schema).toEqual(testSchema)
    })

    it('should assign with nested subSchema successfully', async () => {
      const test = { $ref: '#/definitions/testSchema', definitions: { testSchema } }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
    })

    it('should assign with cached refs successfully', async () => {
      const test = { $ref: 'http://json-schema.org/draft-04/schema#' }
      const refs = { 'http://json-schema.org/draft-04/schema': testSchema }
      schema = await new Schema(test, refs)

      expect(schema).toEqual(test)
    })

    it('should assign nested path fragments successfully', async () => {
      const test = { $id: 'http://json-schema.org/', items: { $id: 'draft-04/', items: { $ref: 'schema' } } }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
    })

    it('should assign and validate refs to boolean schemas', async () => {
      const test = { $ref: '#/definitions/bool', definitions: { bool: false } }
      schema = await new Schema(test)

      expect(schema).toEqual(test)
      expect(schema.validateSync('foo')).toBe(false)
    })

    it('should throw an error on invalid $ref value', async () => {
      try {
        schema = await new Schema({ $ref: null })
      } catch (e: any) {
        expect(e.message).toBe('#$ref: must be a string')
      }
    })

    it('should throw an error on malformed $ref value', async () => {
      try {
        schema = await new Schema({ $ref: 'http://localhos~t:1234/node#something' })
      } catch (e: any) {
        expect(e.message).toBe('#$ref: is malformed')
      }
    })
  })

  describe('type keyword', () => {
    it('should throw an error on invalid type', async () => {
      try {
        schema = await new Schema({ type: null })
      } catch (e: any) {
        expect(e.message).toBe('#type: must be either a valid type string or list of strings')
      }
    })

    it('should throw an error on invalid type string', async () => {
      try {
        schema = await new Schema({ type: 'steve' })
      } catch (e: any) {
        expect(e.message).toBe('#type: \'steve\' is not a valid JSON Schema type')
      }
    })

    it('should throw an error on invalid type array', async () => {
      try {
        schema = await new Schema({ type: [1] })
      } catch (e: any) {
        expect(e.message).toBe('#type: type arrays must contain only string')
      }
    })
  })

  describe('definitions keyword', () => {
    beforeEach(async () => {
      schema = await new Schema(draft04Schema)
    })

    it('should validate successfully', () => {
      expect(schema.validateSync({ definitions: { foo: { type: 'integer' } } })).toBe(true)
    })

    it('should throw an error on invalid data', () => {
      expect(schema.validateSync({ definitions: { foo: { type: 1 } } })).toBe(false)
    })
  })

  describe('validate complex functions with inlined changes to array keywords', () => {
    const complexSchema = {
      type: ['array', 'null'],
      minItems: 1
    }

    describe('item keyword with object JSON schema', () => {
      beforeEach(async () => {
        schema = await new Schema({
          type: 'array',
          items: complexSchema,
          contains: complexSchema
        })
      })

      it('should validate successfully', () => {
        expect(schema.validateSync([null])).toBe(true)
        expect(schema.validateSync([[null]])).toBe(true)
      })

      it('should validate unsuccessfully', () => {
        expect(schema.validateSync([[]])).toBe(false)
        expect(schema.validateSync([false])).toBe(false)
      })
    })

    describe('item keyword with tuple JSON schema', () => {
      beforeEach(async () => {
        schema = await new Schema({
          type: 'array',
          items: [complexSchema, complexSchema],
          additionalItems: complexSchema
        })
      })

      it('should validate successfully', () => {
        expect(schema.validateSync([null, null, null])).toBe(true)
        expect(schema.validateSync([[null], [null], [null]])).toBe(true)
      })

      it('should validate unsuccessfully', () => {
        expect(schema.validateSync([[]])).toBe(false)
        expect(schema.validateSync([null, null, false])).toBe(false)
      })
    })
  })

  describe('validate complex functions with inlined changes to object keywords', () => {
    describe('validations for properties, patternProperties, additionalProperties, and dependencies', () => {
      const complexSchema = {
        type: ['object', 'null'],
        minProperties: 2
      }

      beforeEach(async () => {
        schema = await new Schema({
          type: 'object',
          properties: { test: complexSchema },
          patternProperties: { '^another': complexSchema },
          additionalProperties: complexSchema,
          dependencies: { test: complexSchema }
        })
      })

      it('should validate successfully', () => {
        expect(schema.validateSync({ test: null, another: null, additional: null })).toBe(true)
      })

      it('should validate unsuccessfully', () => {
        expect(schema.validateSync({ test: null })).toBe(false)
        expect(schema.validateSync({ test: false, another: false, additional: false })).toBe(false)
        expect(schema.validateSync({ test: null, another: false, additional: false })).toBe(false)
        expect(schema.validateSync({ test: null, another: null, additional: false })).toBe(false)
      })
    })

    describe('validations for propertyNames keyword', () => {
      beforeEach(async () => {
        schema = await new Schema({
          type: 'object',
          propertyNames: { type: 'string', const: 'test' }
        })
      })

      it('should validate successfully', () => {
        expect(schema.validateSync({ test: true })).toBe(true)
      })

      it('should validate unsuccessfully', () => {
        expect(schema.validateSync({ testing: false })).toBe(false)
      })
    })
  })

  describe('validate complex functions with inlined changes to logical keywords', () => {
    const complexSchema = {
      type: ['string', 'null'],
      minLength: 2
    }

    beforeEach(async () => {
      schema = await new Schema({
        type: 'object',
        properties: {
          allOf: { allOf: [complexSchema, complexSchema] },
          anyOf: { anyOf: [complexSchema, complexSchema] },
          not: { not: complexSchema },
          oneOf: { oneOf: [complexSchema] }
        }
      })
    })

    it('should validate successfully', () => {
      expect(schema.validateSync({ allOf: null, anyOf: null, not: false, oneOf: null })).toBe(true)
    })

    it('should validate unsuccessfully', () => {
      expect(schema.validateSync({ allOf: false, anyOf: null, not: false, oneOf: null })).toBe(false)
      expect(schema.validateSync({ allOf: null, anyOf: false, not: false, oneOf: null })).toBe(false)
      expect(schema.validateSync({ allOf: null, anyOf: null, not: null, oneOf: null })).toBe(false)
      expect(schema.validateSync({ allOf: null, anyOf: null, not: false, oneOf: false })).toBe(false)
    })
  })
})

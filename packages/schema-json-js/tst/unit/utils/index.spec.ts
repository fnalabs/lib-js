/* eslint-env jest */
import nock from 'nock'

import { getSchema } from '../../../src/utils'
import draft04Schema from '../../refs/json-schema-draft-04.json'

describe('getSchema', () => {
  afterAll(() => {
    nock.enableNetConnect()
  })

  beforeAll(() => {
    nock.disableNetConnect()
  })

  describe('from http endpoints', () => {
    afterEach(() => {
      nock.cleanAll()

      if (typeof global.fetch !== 'undefined') jest.restoreAllMocks()
    })

    beforeEach(() => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, draft04Schema)

      if (typeof global.fetch !== 'undefined') {
        jest.spyOn(global, 'fetch').mockImplementation(async () => await Promise.resolve({ json: () => draft04Schema } as unknown as Response))
      }
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('http://json-schema.org/draft-04/schema', false)).toEqual(draft04Schema)
    })
  })

  describe('from https endpoints', () => {
    afterEach(() => {
      nock.cleanAll()

      if (typeof global.fetch !== 'undefined') jest.restoreAllMocks()
    })

    beforeEach(() => {
      nock('https://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, draft04Schema)

      if (typeof global.fetch !== 'undefined') {
        jest.spyOn(global, 'fetch').mockImplementation(async () => await Promise.resolve({ json: () => draft04Schema } as unknown as Response))
      }
    })

    it('should request the schema successfully', async () => {
      expect(await getSchema('https://json-schema.org/draft-04/schema')).toEqual(draft04Schema)
    })
  })

  describe('from endpoints that cause errors', () => {
    afterEach(() => {
      nock.cleanAll()

      if (typeof global.fetch !== 'undefined') jest.restoreAllMocks()
    })

    // TODO: double check this is working right
    it('should expect to catch an error on 500 status code', async () => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(500, {})

      if (typeof global.fetch !== 'undefined') {
        jest.spyOn(global, 'fetch').mockImplementation(async () => await Promise.resolve({
          json: () => {
            throw new Error('Request Failed.\nStatus Code: 500')
          }
        } as unknown as Response))
      }

      try {
        await getSchema('http://json-schema.org/draft-04/schema', false)
      } catch (e: any) {
        expect(e.message).toBe('Request Failed.\nStatus Code: 500')
      }
    })

    it('should expect to catch an error on invalid content type', async () => {
      nock('http://json-schema.org')
        .get('/draft-04/schema')
        .reply(200, undefined)

      if (typeof global.fetch !== 'undefined') {
        jest.spyOn(global, 'fetch').mockImplementation(async () => await Promise.resolve({ json: () => undefined } as unknown as Response))
      }

      try {
        await getSchema('http://json-schema.org/draft-04/schema', false)
      } catch (e: any) {
        expect(e.message).toBe('Invalid content-type.\nExpected \'application/json\' but received undefined')
      }
    })
  })
})

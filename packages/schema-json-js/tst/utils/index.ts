/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-env jest */
import fs from 'fs'
import { JSONSchema, ValidationFunc } from '../../src/@types'
import Schema from '../../src/Schema'

export interface Test {
  description: string
  data: any
  valid: boolean
}
export interface TestSuite {
  description: string
  schema: JSONSchema|boolean
  tests: Test[]
}

export async function getTests (dir: string, filterList: string[] = []): Promise<TestSuite[]> {
  return await new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) reject(err)

      const tests: TestSuite[] = []
      for (const file of files) {
        if (file.includes('.json') && filterList.includes(file)) {
          const data = fs.readFileSync(`${dir}/${file}`, 'utf8')
          tests.push(...JSON.parse(data))
        }
      }
      resolve(tests)
    })
  })
}

export function runTests (tests: TestSuite[]): void {
  for (const testSuite of tests) {
    for (const test of testSuite.tests) {
      it(`${testSuite.description}; ${test.description}`, async () => {
        const schema = await new Schema(testSuite.schema as boolean)
        expect(await schema.validate(test.data)).toBe(test.valid)
      })
    }
  }
}

export function assertOptimized (value, schema: object | boolean, optimized: ValidationFunc[]): unknown {
  if (schema === false) return new Error('\'false\' Schema invalidates all values')
  if (optimized.length === 1) {
    const error = optimized[0](value, schema as JSONSchema)
    if (error) return error
  }
  for (const fn of optimized) {
    const error = fn(value, schema as JSONSchema)
    if (error) return error
  }
}

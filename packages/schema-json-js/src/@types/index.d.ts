import { JSONSchema6 } from 'json-schema'

export interface JSONSchema extends JSONSchema6 {
  id?: string
  type?: string|string[]
}

export type AssertionFunc = (value: any, referred?: JSONSchema) => boolean
export type ValidationFunc = (data: any, schema: JSONSchema) => unknown
export interface ValidationRef {
  referred: JSONSchema
  fn: ValidationFunc
}

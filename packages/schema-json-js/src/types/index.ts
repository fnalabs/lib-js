import type { JSONSchema4, JSONSchema6Definition, JSONSchema7Definition } from 'json-schema'
import type { Schema } from '../Schema'

export type JSONSchema = JSONSchema4 & JSONSchema6Definition & JSONSchema7Definition
export type AssertionFunc = (value: unknown, referred?: Schema) => boolean
export type ValidationFunc = (data: unknown, schema: Schema) => unknown
export interface ValidationRef {
  referred: Schema
  fn: ValidationFunc
}
export interface SchemaRefs {
  [schemaUrl: string]: Schema
}

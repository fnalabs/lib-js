/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// imports
import { JSONSchema, ValidationFunc, ValidationRef } from './@types'
import * as builders from './assertions/builders'
import {
  OPTIMIZED,
  isArray, isEnum, isObject, isParentKeyword, isPathFragment,
  isRef, isSchemaType, isSubSchema, isString, isUndefined
} from './assertions/types'
import { getSchema } from './utils'

// "private" properties
const ERRORS = Symbol('cache of all errors as they occurred during validation')
const REFS = Symbol('cache of all referenced schemas in current schema')

// constants
const enumerable = true
const tildeZeroRegex = /~0/g
const tildeOneRegex = /~1/g

/**
 * <p>Class representing the definition and assertion methods for JSON Schema validation. Creates an immutable instance of a JSON Schema either immediately or lazily depending on your needs. When assigning a JSON Schema, it first validates the JSON Schema definition. Then it creates optimized assertion methods for each verified JSON Schema defined either at the root of the Schema or nested within complex Schemas. This allows for faster validations and the ability to perform partial Schema validations for nested definitions to test a change to a Model.</p>
 * <p>There are many ways to create a Schema instance, either instantly or lazily. The Schema class also supports fetching remote referenced JSON Schemas on a supported web client or Node.js service. Be mindful of the argument order, if omitting <code>schema</code> and/or <code>refs</code>, the desired arguments need to maintain the order in which they are defined.</p>
 * @property {Array<string>} errors - A copy of the List of error strings from the last time {@link validate} ran.
 * @param {Object|Boolean} [schema] - Optional JSON Schema definition.
 * @param {Object} [refs] - Optional hash of cached JSON Schemas that are referenced in the main schema.
 * @async
 */
class Schema {
  constructor (_schema?: object|boolean, _refs?: object) {
    Object.defineProperties(this, {
      [ERRORS]: { value: [] },
      [REFS]: { value: {} }
    })
  }

  get errors (): string[] {
    return [...this[ERRORS]]
  }

  /**
   * Method used to define and optimize the JSON Schema instance with the supplied JSON Schema definition and optionially cached references of other JSON Schema definitions.
   * @param {Object} schema - The supplied JSON Schema definition.
   * @param {Object} [refs] - Optionally supplied cached references of other JSON Schema definitions.
   * @returns {Schema} The instance of the JSON Schema definition.
   * @async
   */
  async assign (schema: JSONSchema, refs?: object): Promise<Schema> {
    if (isObject(refs)) await this.ASSIGN_REFS(refs as object)

    this.ASSIGN_SCHEMA(this, schema)

    const schemaId = schema.$id ?? schema.id
    if (typeof schemaId !== 'undefined' && isString(schemaId)) Object.defineProperty(this[REFS], schemaId, { value: this, enumerable })

    await this.ASSIGN_OPTIMIZED(this)
    Object.freeze(this[REFS])

    return this
  }

  /**
   * The default async method used to validate data against the JSON Schema instance. This method will also accept a nested reference of the JSON Schema if you choose to validate individual properties, subdocuments, and more.
   * @param data - The data to validate against the JSON Schema definition instance.
   * @param {Schema} [schema=this] - Optionally pass nested JSON Schema definitions of the instance for partial schema validation or other instances of the JSON Schema class.
   * @returns {Schema} The instance of the JSON Schema definition.
   * @async
   */
  async validate (data, schema: object | boolean = this): Promise<boolean> {
    return this.VALIDATE(data, schema)
  }

  /**
   * A syncronous method used to validate data against the JSON Schema instance. This method will also accept a nested reference of the JSON Schema if you choose to validate individual properties, subdocuments, and more. <strong>NOTE:</strong> This performs better than async but may cause challenges with performance for complex schemas.
   * @param data - The data to validate against the JSON Schema definition instance.
   * @param {Schema} [schema=this] - Optionally pass nested JSON Schema definitions of the instance for partial schema validation or other instances of the JSON Schema class.
   * @returns {Schema} The instance of the JSON Schema definition.
   */
  validateSync (data, schema: object | boolean = this): boolean {
    return this.VALIDATE(data, schema)
  }

  /**
   * Private method used to validate supplied data against the JSON Schema definition instance. Is leveraged with both <code>synchronous</code> or <code>asynchronous</code> methods.
   * @function Schema.prototype.validate
   * @param data - The data to validate against the JSON Schema definition instance.
   * @param {Schema} [schema=this] - Optionally pass nested JSON Schema definitions of the instance for partial schema validation or other instances of the JSON Schema class.
   * @returns {Boolean} <code>true</code> if validation is successful, otherwise <code>false</code>.
   * @private
   */
  private VALIDATE (data, schema: object|boolean = this): boolean {
    this[ERRORS].length = 0

    if (schema === false) this[ERRORS].push('\'false\' JSON Schema invalidates all values')
    else if (schema[OPTIMIZED]) {
      this[ERRORS].push(schema[OPTIMIZED](data, schema))
      if (!this[ERRORS][this[ERRORS].length - 1]) this[ERRORS].pop()
    }

    return this[ERRORS].length === 0
  }

  /**
   * Iteratively assigns the provided JSON Schema definition to the root of the instance JSON Schema object.
   * @param {this} root - The root of the instance JSON Schema object.
   * @param {JSONSchema} schema - The JSON Schema definition about to be assigned.
   * @private
   */
  private ASSIGN_SCHEMA (root, schema: JSONSchema): void {
    if (!isObject(schema)) throw new TypeError('JSON Schemas must be an object at root')

    // iterate over object/array passed as source schema
    const assign = (object, source: JSONSchema, path: string[] = []): void => {
      const keys = Object.keys(source)
      let index = keys.length
      while (index--) {
        const value = source[keys[index]]
        if (typeof value === 'object' && value !== null) {
          Object.defineProperty(object, keys[index], {
            enumerable,
            value: isArray(value)
              ? assign([], value, [...path, keys[index]])
              : assign({}, value, [...path, keys[index]])
          })
        } else Object.defineProperty(object, keys[index], { enumerable, value })
      }

      const tempId = source.$id ?? source.id
      if (isString(tempId) && isSubSchema(tempId as string, path)) {
        Object.defineProperty(this[REFS], tempId as string, { enumerable, value: object })
      }

      return object
    }
    assign(root, schema)
  }

  /**
   * Assigns an in-memory reference to a <code>ref</code> using its JSON Schema URL.
   * @param {String} schemaUrl - The JSON Schema URL to associate the <code>ref</code> with.
   * @param {JSONSchema} ref - A valid JSON Schema.
   * @private
   */
  private async ASSIGN_REF (schemaUrl: string, ref: JSONSchema): Promise<void> {
    Object.defineProperty(this[REFS], schemaUrl, { value: {}, enumerable })
    this.ASSIGN_SCHEMA(this[REFS][schemaUrl], ref)
    return await this.ASSIGN_OPTIMIZED(this[REFS][schemaUrl])
  }

  /**
   * Iterates over a <code>refs</code> object literal to assign a cached reference to all JSON Schema <code>refs</code> for this Schema.
   * @param {Object} refs - An object literal containing the schemaUrl and matching JSON Schemas for all refs.
   * @private
   */
  private async ASSIGN_REFS (refs: object): Promise<void> {
    const keys = Object.keys(refs)
    let index = keys.length
    while (index--) await this.ASSIGN_REF(keys[index], refs[keys[index]])
  }

  /**
   * Iterates over the Schema object to add optimized cached assertions to each layer of a valid JSON Schema.
   * @param {Object} schema - A valid JSON Schema instance.
   * @private
   */
  private async ASSIGN_OPTIMIZED (schema): Promise<void> {
    const schemaId = schema.$id ?? schema.id

    const assign = async (source, path: string[] = []): Promise<void> => {
      if (isObject(source) && !isParentKeyword(path)) {
        const { $id, $ref, id } = source
        const list: ValidationFunc[] = []
        let value

        if (!isUndefined($ref)) list.push(...(await this.ASSERT_REF($ref, schema, path)))
        else {
          list.push(this.ASSERT_SCHEMA(source))

          const tempId = $id ?? id
          if (!isUndefined(tempId) && tempId !== schemaId) {
            list.push(...(await this.ASSERT_REF(tempId, schema, path)))
          }
        }

        if (list.length !== 0) {
          value = list.length === 1
            ? list.pop()
            : (data, schema) => {
              let i = list.length
              let error
              while (i--) {
                error = list[i](data, schema)
                if (error) return error
              }
            }

          Object.defineProperty(source, OPTIMIZED, { value })
          Object.freeze(source[OPTIMIZED])
        }
      }

      const keys = Object.keys(source)
      let index = keys.length
      while (index--) {
        const value = source[keys[index]]
        if (typeof value === 'object' && value !== null) await assign(value, [...path, keys[index]])
      }
      return Object.freeze(source)
    }
    return await assign(schema)
  }

  /*
   * ref assertions
   */
  private async ASSERT_REF ($ref: string, root: JSONSchema, path: string[]): Promise<ValidationFunc[]> {
    if (!isString($ref)) throw new TypeError('#$ref: must be a string')
    if (isPathFragment($ref)) return []

    const match = isRef($ref)
    if (match.length === 0) throw new SyntaxError('#$ref: is malformed')

    const assertion = $ref[0] === '#'
      ? this.ASSERT_REF_POINTER(match[0].split('#')[1], root)
      : (match[1] && match[2])
        ? await this.ASSERT_REF_ABSOLUTE(match)
        : await this.ASSERT_REF_RELATIVE(match, root, path)

    const { referred, fn } = assertion
    if (fn && isObject(referred)) {
      return [value => fn(value, referred)]
    } else if (referred === false) {
      return [() => 'a \'false\' JSON Schema invalidates all values']
    }
    return []
  }

  private async ASSERT_REF_ABSOLUTE (match: string[]): Promise<ValidationRef> {
    const schemaUrl = match[0].split('#')[0]
    const secure = match[2] === 'https'

    let referred = this[REFS][schemaUrl]
    if (isUndefined(referred)) {
      const schema = await getSchema(schemaUrl, secure)
      referred = await this.ASSIGN_REF(schemaUrl, schema)
    }

    if (match[3].includes('#')) {
      return this.ASSERT_REF_POINTER(match[3].split('#')[1], referred)
    }

    const fn = this.ASSERT_SCHEMA(referred)
    return { referred, fn }
  }

  private async ASSERT_REF_RELATIVE (match: string[], root: JSONSchema, path: string[]): Promise<ValidationRef> {
    let absMatch: string[] = []
    if (isString(root.$id)) absMatch = isRef(root.$id as string)
    else if (isString(root.id)) absMatch = isRef(root.id as string)

    // build Schema path by traversing schema from root, checking for ($)id path fragments
    let temp = absMatch[1]
    let schema = root
    for (let index = 0, length = path.length; index < length; index++) {
      schema = schema[path[index]]
      if (isString(schema.$id) && isPathFragment(schema.$id as string)) temp = `${temp}${schema.$id}` // eslint-disable-line @typescript-eslint/restrict-template-expressions
      else if (isString(schema.id) && isPathFragment(schema.id as string)) temp = `${temp}${schema.id}` // eslint-disable-line @typescript-eslint/restrict-template-expressions
    }

    absMatch[0] = `${temp}${match[0]}`
    absMatch[3] = `${match[0]}`

    return await this.ASSERT_REF_ABSOLUTE(absMatch)
  }

  private ASSERT_REF_POINTER (pointer: string, root: JSONSchema): ValidationRef {
    // recursive traversal of root in case of recursive references
    const traverse = (ptr: string): JSONSchema => {
      const keys: string[] = ptr.split('/')
      let ref = root

      keys.shift()
      if (keys.length !== 0) {
        // NOTE: must be a incrementing loop since we need to traverse in order
        for (let index = 0, length = keys.length; index < length; index++) {
          ref = ref[keys[index].replace(tildeOneRegex, '/').replace(tildeZeroRegex, '~')]
        }
      }

      if (ref.$ref) return traverse(ref.$ref.split('#')[1])
      return ref
    }

    const referred = traverse(pointer)
    const fn = this.ASSERT_SCHEMA(referred)
    return { referred, fn }
  }

  /*
   * schema assertions
   */
  private ASSERT_SCHEMA (schema: JSONSchema): ValidationFunc {
    const list: ValidationFunc[] = []

    // assert schema type
    if (!isUndefined(schema.type)) list.push(...this.ASSERT_TYPE(schema))

    // assert schema for generic and primitive type keywords
    list.push(...builders.AssertGeneric.getInstance().optimize(schema))
    list.push(...builders.AssertBoolean.getInstance().optimize(schema))
    list.push(...builders.AssertNull.getInstance().optimize(schema))
    list.push(...builders.AssertNumber.getInstance().optimize(schema))
    list.push(...builders.AssertString.getInstance().optimize(schema))

    // assert schema for complex type keywords
    list.push(...builders.AssertArray.getInstance().optimize(schema))
    list.push(...builders.AssertObject.getInstance().optimize(schema))

    // assert schema for logical operation keywords
    list.push(...builders.AssertLogical.getInstance().optimizeAllOf(schema))
    list.push(...builders.AssertLogical.getInstance().optimizeAnyOf(schema))
    list.push(...builders.AssertLogical.getInstance().optimizeNot(schema))
    list.push(...builders.AssertLogical.getInstance().optimizeOneOf(schema))

    return list.length === 1
      ? list.pop() as ValidationFunc
      : (data, schema) => {
        let i = list.length
        let error
        while (i--) {
          error = list[i](data, schema)
          if (error) return error
        }
      }
  }

  /*
   * type assertions
   */
  private ASSERT_TYPE (schema: JSONSchema): ValidationFunc[] {
    const { type } = schema

    // assert schema type
    if (isString(type)) {
      if (!isSchemaType(type)) throw new ReferenceError(`#type: '${type as string}' is not a valid JSON Schema type`)
      return []
    } else if (isArray(type)) {
      if (!isEnum(type as [], isSchemaType)) throw new TypeError('#type: type arrays must contain only string')

      const list = (type as []).map(val => this.ASSERT_SCHEMA({ type: val }))
      return [(value, ref) => {
        let index = list.length
        while (index--) if (!list[index](value, ref)) return
        return '#type: value does not match the List of types'
      }]
    } else throw new TypeError('#type: must be either a valid type string or list of strings')
  }
}

/*
 * Proxy<Schema> for async initialization of the schema and optional refs
 */
export default new Proxy(Schema, {
  construct: async function (Schema, argsList) {
    if (isUndefined(argsList[0])) return new Schema()
    if (isUndefined(argsList[1])) return await new Schema().assign(argsList[0])
    return await new Schema().assign(argsList[0], argsList[1])
  }
})

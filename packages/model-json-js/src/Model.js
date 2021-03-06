// imports
import Schema from 'schema-json-js'

// protected porperties
const VERSION = Symbol('optional aggregate version')

// "private" properties
const DESCRIPTORS = Symbol('hash of recognized descriptors')
const SCHEMA = Symbol('Schema object that defines the data model')

// "private" methods
const CREATE_MODEL = Symbol('creating a Model')

// constants
const DEFAULT_DESCRIPTORS = {
  configurable: true,
  enumerable: true,
  writable: true
}
// default JSON Schema
const EmptySchema = {}

/**
 * <p>Factory class to generate <code>Model</code> instances against their JSON Schema definitions. This class adheres to the <a href="https://github.com/redux-utilities/flux-standard-action" target="_blank">Flux Standard Action (FSA)</a> specification and generates FSA representations of itself when transfromed to JSON. Therefore, it expects <code>data</code> to be provided in the same structure. The Model class implements a similar pattern to Object property descriptors, allowing you to set whether the instance's properties are <code>configurable</code>, <code>enumerable</code>, and/or <code>writable</code>. We have added another descriptor, <code>immutable</code>, to allow for the creation of immutable instances of a Model.</p>
 * <p><strong><em>NOTE:</em></strong> Third argument in the constructor can be either a JSON Schema <code>refs</code> object or a <code>descriptors</code> object if <code>refs</code> aren't required.</p>
 * @param {Object} data - A FSA Object literal containing the Model's <code>type</code> and optional <code>meta</code> and <code>payload</code>.
 * @param {Object|Schema} schema - An Object literal or Schema instance containing the JSON Schema definition of the Model.
 * @param {Object} [refs] - An optional Object literal of cached JSON Schema definitions referenced in the main schema.
 * @param {Object} [descriptors={ configurable: true, enumerable: true, writable: true }] - An optional Object literal containing the desired property descriptors for the Model instance.
 * @async
 */
class Model {
  constructor (data, schema, descriptors = DEFAULT_DESCRIPTORS) {
    const { type, payload = {}, meta } = data

    // validate
    if (!(payload && typeof payload === 'object' && !Array.isArray(payload))) {
      throw new TypeError('#Model: payload must be an object if defined')
    }
    if (schema.title && type !== schema.title) {
      throw new TypeError('#Model: data type does not match Schema')
    }

    // init properties
    if (meta && meta.version) Model.version(this, meta.version)
    Object.defineProperties(this, {
      [DESCRIPTORS]: descriptors.immutable ? { value: { immutable: true } } : { value: { ...descriptors } },
      [SCHEMA]: { value: schema }
    })

    // parse descriptors and initialize model with payload
    const parsedDescriptors = descriptors.immutable ? { enumerable: true } : { ...descriptors }
    return this[CREATE_MODEL](this, payload, parsedDescriptors)
  }

  /**
   * Method used to iteratively assign data to the model.
   * @param {Object} object - Recursive reference to the Model instance as data is assigned.
   * @param {Object} source - Recursive reference to the source data being assigned to the Model instance.
   * @param {Object} descriptors - An Object literal containing the descriptors to attach to the Model instance's properties along with its associated data.
   * @returns {Object} The Model instance with all of the assigned data.
   * @private
   */
  [CREATE_MODEL] (object, source, descriptors) {
    // iterate over object/array passed as source data
    const keys = Object.keys(source)
    for (let i = 0, len = keys.length; i < len; i++) {
      const value = source[keys[i]]
      if (value && typeof value === 'object') {
        Object.defineProperty(object, keys[i], {
          ...descriptors,
          value: Array.isArray(value)
            ? this[CREATE_MODEL]([], value, descriptors)
            : this[CREATE_MODEL]({}, value, descriptors)
        })
      } else Object.defineProperty(object, keys[i], { ...descriptors, value })
    }

    // check if descriptor specifies immutable
    if (this[DESCRIPTORS].immutable) return Object.freeze(object)
    else {
      // return Array instance if in a recursive call
      if (Array.isArray(object)) return object

      // return a proxy to the object to enforce all added properties to use model descriptors
      return new Proxy(object, {
        defineProperty: (object, property, descriptor) =>
          typeof property === 'symbol'
            ? Object.defineProperty(object, property, { value: descriptor.value })
            : Object.defineProperty(object, property, { ...descriptors, value: descriptor.value })
      })
    }
  }

  /**
   * Method used to transform the Model instance to conform to the FSA specification standard action definition.
   * @returns {Object} An Object literal containing the <code>meta</code> and optional <code>data</code> of the Model instance.
   */
  toJSON () {
    const ret = { type: this[SCHEMA].title }

    // add data
    if (Object.keys(this).length) ret.payload = { ...this }

    // add metadata
    if (this[VERSION]) ret.meta = { version: this[VERSION] }

    return ret
  }

  /**
   * Static method to get the version associated with the instance of a Model.
   * @param {Model} model - The Model instance.
   * @param {Number} [version] - An optional version Number to set
   * @returns {Number|undefined} - The version of the Model instance.
   */
  static version (model, version) {
    if (Number.isInteger(version)) {
      typeof model[VERSION] !== 'undefined'
        ? model[VERSION] = version
        : Object.defineProperty(model, VERSION, { writable: true, value: version })
    }

    return model[VERSION]
  }

  /**
   * Static method to get the JSON Schema instance associated with the instance of a Model.
   * @param {Model} model - The Model instance.
   * @returns {Schema} - The associated JSON Schema instance.
   */
  static schema (model) {
    return model[SCHEMA]
  }

  /**
   * Static method to get the List of errors from the last time <code>validate</code> was called on the associated JSON Schema instance from the Model instance.
   * @param {Model} model - The Model instance.
   * @returns {Array<string>} The List of errors.
   */
  static errors (model) {
    return model[SCHEMA].errors
  }

  /**
   * Static method to manually run the JSON Schema instance's <code>validate</code> method on the specified Model instance. This method will also perform partial schema validation if passed as the second parameter.
   * @param {Model} model - The Model instance.
   * @param {Schema} [schema] - An optional JSON Schema instance.
   * @returns {Boolean} <code>true</code> if validation is successful, otherwise <code>false</code>.
   */
  static validate (model, schema) {
    return model[SCHEMA].validate(model, schema || model[SCHEMA])
  }
}

/*
 * Proxy<Model> for async initialization of the schema and validation of data on construction
 */
export default new Proxy(Model, {
  construct: async function (Model, argsList) {
    // init optional refs and descriptors
    let descriptors = argsList[3]
    let refs = argsList[2]
    if (refs && typeof refs === 'object' && !Array.isArray(refs) && !Object.keys(refs)[0].indexOf('http') !== 0) {
      descriptors = refs
      refs = undefined
    }

    // init schema
    let schema = argsList[1]
    if (!(schema && typeof schema === 'object')) schema = await new Schema(EmptySchema)
    else if (!(schema instanceof Schema)) schema = await new Schema(schema, refs)

    // validate data and return new Model
    const data = argsList[0]
    if (!(data && typeof data === 'object' && !Array.isArray(data))) {
      throw new TypeError('Model data must be an object')
    }
    if (schema.isAsync) {
      if (!await schema.validate(data.payload)) throw new Error(...schema.errors)
    } else {
      if (!schema.validate(data.payload)) throw new Error(...schema.errors)
    }

    return new Model(data, schema, descriptors)
  }
})

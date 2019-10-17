# Model(JSON)<sup>js</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A JavaScript Model class designed to serialize and transfer structured data within the services/apps you build or across networks. It is paired with [Schema(JSON)<sup>js</sup>](https://fnalabs.github.io/schema-json-js/) to provide structure and validation capabilities to your data model.

Motivations behind the project:
- implement a data serialization solution for structured JSON data
- backed with JSON Schema definition/validation
- leverage modern JS features
- small and lightweight with only one dependency
- universal support for the latest browsers and Node.js
- no code generation

#### Contents
- [Installing](#installing)
- [Examples](#examples)
- [API](#api)
- [Environments](#environments)
- [Future](#future)
- [Contributing](#contributing)
- [Changelog](#changelog)

## Installing
Install using `npm`:
```sh
$ npm install --save model-json-js
```

## Examples
Below are a few examples on how to use the Model and Schema classes. For the sake of the following examples, here is a sample Schema we'll reference with all the examples.
```javascript
// JSON Schema
const TestSchema = {
  title: 'Test',
  $id: 'https://hiveframework.io/api/v1/models/Test',
  type: 'object',
  properties: {
    test: {
      type: 'string'
    },
    another: {
      type: 'string'
    }
  },
  required: ['test']
}
// model metadata
const meta = {
  schema: 'https://hiveframework.io/api/v1/models/Test'
}
// model FSA
const testData = {
  type: 'Test',
  payload: { test: 'object' },
  meta
}
```

#### Initialization:
---
- An example Model initialized with raw data and schema.
  ```javascript
  const model = await new Model(testData, TestSchema)
  ```

- An example Model initialized with a cached JSON Schema references defined.
  ```javascript
  const testSchema = await new Schema(TestSchema)
  // ...
  const model = await new Model(testData, testSchema)
  ```

- An example immutable Model initialized with raw data and schema.
  ```javascript
  const model = await new Model(testData, TestSchema, { immutable: true })
  ```

#### Validation:
---
- Validate the entire Model.
  ```javascript
  const isValid = Model.validate(model)
  ```

- Validate a single property of the model
  ```javascript
  const isValid = Model.validate(model.test, Model.schema(model).test)
  ```

#### Serialization:
---
- Serialize the Model with JSON stringify.
  ```javascript
  const json = JSON.stringify(model)
  ```

## API
- [Model](https://fnalabs.github.io/model-json-js/Model.html)
- [Schema](https://fnalabs.github.io/model-json-js/Schema.html)

## Environments
- All modern browsers and Node 8+ without polyfills.

## Future
- create benchmarks
- create contributing guide
- feature requests via [issues](https://github.com/fnalabs/model-json-js/issues)

## Contributing
We are currently drafting our contributing guide!

## Changelog
#### v0.3.1
- updated dependencies

#### v0.3.0
- added `version` setter functionality to static function
- updated documentation

#### v0.2.0
- added `sync` validation support during Model creation
- updated documentation and dependencies

#### v0.1.1
- updated documentation and dependencies

#### v0.1.0
- initial release

[npm-image]: https://img.shields.io/npm/v/model-json-js.svg
[npm-url]: https://www.npmjs.com/package/model-json-js

[license-image]: https://img.shields.io/badge/License-MIT-blue.svg
[license-url]: https://github.com/fnalabs/model-json-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/model-json-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/model-json-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/model-json-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/model-json-js

[depstat-image]: https://img.shields.io/david/fnalabs/model-json-js.svg
[depstat-url]: https://david-dm.org/fnalabs/model-json-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com

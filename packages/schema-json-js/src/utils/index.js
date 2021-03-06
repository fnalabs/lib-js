/* globals fetch */
import { isFunction, isString } from '../assertions/types'

const contentTypeRegex = /^application\/json/

// verify execution environment
let http, https
if (!isFunction(global.fetch)) {
  http = require('http')
  https = require('https')
}

async function nodeFetch (url, secure) {
  const request = secure ? https : http

  return new Promise((resolve, reject) => {
    request.get(url, (response) => {
      const { statusCode } = response
      const contentType = response.headers['content-type']

      let error
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\nStatus Code: ${statusCode}`)
      } else if (!contentTypeRegex.test(contentType)) {
        error = new Error(`Invalid content-type.\nExpected application/json but received ${contentType}`)
      }

      if (error) {
        // consume response data to free up memory
        response.resume()
        reject(error)
      } else {
        let rawData = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => (rawData += chunk))
        response.on('end', () => {
          try {
            resolve(JSON.parse(rawData))
          } catch (e) {
            reject(e)
          }
        })
      }
    }).on('error', (e) => reject(e))
  })
}

export async function getSchema (url, secure = true) {
  if (!isString(url)) throw new Error('#getSchema: url must be a string')

  if (isFunction(global.fetch)) return fetch(url).then(response => response.json())

  return nodeFetch(url, secure)
}

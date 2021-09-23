import { isFunction, isString } from '../assertions/types'

const contentTypeRegex = /^application\/json/

// verify execution environment
let http, https
if (!isFunction(global.fetch)) {
  http = require('http')
  https = require('https')
}

async function nodeFetch (url: string, secure: boolean = true): Promise<any> {
  const request = secure ? https : http

  return await new Promise((resolve, reject) => {
    request.get(url, response => {
      const { statusCode } = response
      const contentType: string = response.headers['content-type']

      let error: Error|undefined
      if (statusCode !== 200) {
        error = new Error(`Request Failed.\nStatus Code: ${statusCode}`) // eslint-disable-line @typescript-eslint/restrict-template-expressions
      } else if (!contentTypeRegex.test(contentType)) {
        error = new Error(`Invalid content-type.\nExpected 'application/json' but received ${contentType}`)
      }

      if (typeof error !== 'undefined') {
        // consume response data to free up memory
        response.resume()
        reject(error)
      } else {
        let rawData = ''
        response.setEncoding('utf8')
        response.on('data', (chunk: string) => (rawData += chunk))
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

export default async function getSchema (url: string, secure: boolean = true): Promise<any> {
  if (!isString(url)) throw new Error('#getSchema: url must be a string')

  if (isFunction(global.fetch)) return await global.fetch(url).then(async response => await response.json())

  return await nodeFetch(url, secure)
}

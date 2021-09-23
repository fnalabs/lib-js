/* eslint-env jest */
import * as optimize from '../../../../src/assertions/types/optimize'

describe('optimize assertions', () => {
  it('should assert maximum size keywords successfully', () => {
    expect(optimize.assertSizeMax(1, 'maxItems')).toBe(undefined)

    try {
      optimize.assertSizeMax(0, 'maxItems')
    } catch (e: any) {
      expect(e.message).toBe('#maxItems: keyword must be a positive integer')
    }

    try {
      optimize.assertSizeMax(1.1, 'maxItems')
    } catch (e: any) {
      expect(e.message).toBe('#maxItems: keyword must be a positive integer')
    }
  })

  it('should assert minimum size keywords successfully', () => {
    expect(optimize.assertSizeMin(1, 'minItems')).toBe(undefined)

    try {
      optimize.assertSizeMin(0, 'minItems')
    } catch (e: any) {
      expect(e.message).toBe('#minItems: keyword must be a positive integer')
    }

    try {
      optimize.assertSizeMin(1.1, 'minItems')
    } catch (e: any) {
      expect(e.message).toBe('#minItems: keyword must be a positive integer')
    }
  })
})

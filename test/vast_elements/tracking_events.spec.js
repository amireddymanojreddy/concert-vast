import Vast from '../../src/lib/vast'
import * as fs from 'fs'

describe('Media Files extension', () => {
  let xmlString
  let vast

  beforeAll(() => {
    xmlString = fs.readFileSync('./test/fixtures/vast.xml')
    vast = new Vast({ xml: xmlString })
  })

  it('should be able to return all the tracking events for a given name', () => {
    expect(typeof vast.trackingUrlsFor).toBe('function')
  })

  it('should be return an enumerable Array of the tracking urls for a given name', () => {
    expect(vast.trackingUrlsFor('start').constructor).toBe(Array)
  })

  it('should be able to return all the tracking events for a given name', () => {
    expect(vast.trackingUrlsFor('start')[0]).toMatch(/^https:/)
    expect(vast.trackingUrlsFor('firstQuartile')[0]).toMatch(/^https:/)
  })

  it('should be able return all the tracking events for a given name', () => {
    expect(vast.trackingUrlsFor('start').length).toEqual(2)
  })

  it('should return an empty array if there are no tracking events matching this tracker', () => {
    expect(vast.trackingUrlsFor('hiThereMessay')).toEqual([])
  })

  describe('Media Files extension', () => {
    it('should be able to add an impression tracker to the page for a key', () => {
      expect(typeof vast.addImpressionTrackingImagesFor).toBe('function')
    })

    it('should return nothing when adding images to the doc', () => {
      expect(vast.addImpressionTrackingImagesFor('start')).toBe(undefined)
    })

    it('should add some images to the document', () => {
      const existingImages = document.querySelectorAll('img').length
      vast.addImpressionTrackingImagesFor('start')
      expect(document.querySelectorAll('img').length).toBe(2 + existingImages)
    })
  })
})
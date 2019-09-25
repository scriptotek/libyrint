/**
 * @typedef {Object<string, any>} MapDataDocument
 * @property {MapDataImage} image
 * @property {Array} rooms
 * @property {Array} collections
 * @property {Array} markers
 *
 * @typedef {Object<string, any>} MapDataImage
 * @property {string} src
 * @property {number} width
 * @property {number} height
 *
 * @typedef {import("../config").FeatureType} FeatureType
*/
import Feature from './features/Feature'
import { get } from 'lodash/object'
import { isObject } from 'lodash/lang'
import { featureTypes } from '../config'
import EventMixin from './EventMixin'
import classes from './features'
import uuidv4 from 'uuid/v4'

/**
 * @class MapData
 * @mixes EventMixin
 * @property {RoomCollection} rooms
 * @property {CollectionCollection} collections
 * @property {MarkerCollection} markers
 */
class MapData {
  /**
   * Construct MapData object.
   */
  constructor () {
    console.log('[MapData] Init')
    this.selectedFeature = null
  }

  /**
   * Helper method to notify MapData about shape modifications
   * (since we don't have a shape class yet).
   *
   * @param {*} eventName
   * @param  {...any} args
   */
  notify (eventName, ...args) {
    console.log('Got notify', eventName)
    this.emit(eventName, ...args)
  }

  /**
   * Load data onto the MapData object.
   *
   * @param {MapDataDocument} data
   */
  load (data) {
    if (!isObject(data)) {
      throw new Error('Cannot construct MapData from invalid data')
    }

    this.image = data.image

    featureTypes.forEach(featureType => {
      const values = get(data, featureType.key, [])
      this[featureType.key] = classes[featureType.collectionClass].create(values)

      this.passThroughEvent(this[featureType.key], 'shape:created')
      this.passThroughEvent(this[featureType.key], 'shape:modified')
      this.passThroughEvent(this[featureType.key], 'shape:deleted')
      this.passThroughEvent(this[featureType.key], 'feature:propchange')
    })
  }

  /**
   * Serialize the MapData object as an object ready for JSON.stringify.
   *
   * @returns {Object}
   */
  serialize () {
    const out = {
      image: this.image,
    }
    featureTypes.forEach(featureType => {
      out[featureType.key] = this[featureType.key].serialize()
    })
    return out
  }

  /**
   * Assert that some variable is a feature or null.
   *
   * @param {?Feature} feature
   */
  assertFeatureOrNull (feature) {
    if (feature !== null && !(feature instanceof Feature)) {
      throw new Error('Selected object is not a Feature')
    }
  }

  /**
   * Create a new feature.
   *
   * @param {FeatureType} featureType
   * @returns Feature
   */
  createFeature (featureType) {
    console.log('[MapData] Create feature')
    const feature = classes[featureType.class].fromGeoJson({
      geometry: [],
      properties: {
        id: uuidv4(),
        name: `${featureType.label} uten navn`,
      },
    })
    this[featureType.key].push(feature)
    this.emit('feature:created', feature)
    return feature
  }

  /**
   * Select a feature.
   *
   * @param {?Feature} feature
   */
  selectFeature (feature) {
    console.log('[MapData] selectFeature', this.selectedFeature, feature)
    if (this.selectedFeature === feature) {
      return
    }
    this.selectedFeature = feature
    this.emit('feature:selected', feature)
  }

  /**
   * Delete a feature.
   *
   * @param {Feature} feature
   */
  deleteFeature (feature) {
    console.log('[MapData] Delete feature', feature)
    this[feature.type.key].remove(feature)
    this.emit('feature:deleted', feature)
  }
}

Object.assign(MapData.prototype, EventMixin)

export default new MapData()

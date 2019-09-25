import L from 'leaflet'
import EventMixin from '../EventMixin'
/**
 * @typedef {import("./Feature").default} Feature
 */

/**
 * Collection of features (rooms, collections or markers).
 * @mixes EventMixin
 * @extends Array
 */
class FeatureCollection extends Array {
  constructor (...items) {
    super(...items)
    this._layer = null
    this.style = {
      color: 'blue',
      weight: 1,
      dashArray: null,
    }
  }

  /**
   * Construct a new FeatureCollection with data.
   *
   * @param {Feature[]} features
   */
  static create (features) {
    const collection = new this(...features)

    collection._layer = L.layerGroup(
      features.map(
        feature => {
          collection.passThroughEvent(feature, 'shape:created')
          collection.passThroughEvent(feature, 'shape:deleted')
          collection.passThroughEvent(feature, 'feature:propchange')
          return feature.getLayer() // .setDefaultStyle(collection.style).getLayer()
        }
      )
    )
    return collection
  }

  serialize () {
    return this.map(feature => feature.serialize())
  }

  /**
   * Add a new Feature to the collection.
   *
   * @param {Feature} feature
   * @returns {number}
   */
  push (feature) {
    this.passThroughEvent(feature, 'shape:created')
    this.passThroughEvent(feature, 'shape:deleted')
    this.passThroughEvent(feature, 'feature:propchange')
    console.log('[FeatureCollection] Push')
    this._layer.addLayer(feature.getLayer())
    // this._layer.addLayer(feature.setDefaultStyle(this.style).getLayer())
    return super.push(feature)
  }

  /**
   * Remove a feature from the collection.
   *
   * @param {Feature} feature
   */
  remove (feature) {
    const idx = this.indexOf(feature)
    if (idx === -1) {
      throw new Error('Feature is not part of this collection.')
    }
    if (!this._layer.hasLayer(feature.getLayer())) {
      throw new Error('Layer is not part of the collection layer!')
    }
    this._layer.removeLayer(feature.getLayer())
    this.splice(idx, 1)
  }

  /**
   * Get the Leaflet layer group for this collection.
   *
   * @returns {L.LayerGroup} Leaflet layer group
   */
  getLayer () {
    return this._layer
  }
}

Object.assign(FeatureCollection.prototype, EventMixin)

export default FeatureCollection

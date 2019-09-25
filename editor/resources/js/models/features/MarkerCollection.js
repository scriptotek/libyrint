import FeatureCollection from './FeatureCollection'
import Marker from './Marker'

/**
 * Representation of a collection of markers.
 *
 * @extends FeatureCollection
 */
class MarkerCollection extends FeatureCollection {
  /**
   * Create a new collection from serialized data.
   *
   * @param {Array} features
   */
  static create (features) {
    console.log('[MarkerCollection] Construct with ' + features.length + ' features')
    return super.create(features.map(feature => Marker.fromGeoJson(feature)))
  }
}

export default MarkerCollection

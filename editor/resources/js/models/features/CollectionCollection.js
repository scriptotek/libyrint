import FeatureCollection from './FeatureCollection'
import Collection from './Collection'

/**
 * Representation of a collection of collection.
 *
 * @extends FeatureCollection
 */
class CollectionCollection extends FeatureCollection {
  /**
   * Create a new collection from serialized data.
   *
   * @param {Array} features
   */
  static create (features) {
    console.log('[CollectionCollection] Construct with ' + features.length + ' features')
    return super.create(features.map(feature => Collection.fromGeoJson(feature)))
  }
}
export default CollectionCollection

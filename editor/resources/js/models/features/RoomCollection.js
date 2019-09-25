import FeatureCollection from './FeatureCollection'
import Room from './Room'

/**
 * Representation of a collection of rooms.
 *
 * @extends FeatureCollection
 */
class RoomCollection extends FeatureCollection {
  /**
   * Create a new collection from serialized data.
   *
   * @param {Array} features
   */
  static create (features) {
    console.log('[RoomCollection] Construct with ' + features.length + ' features')
    return super.create(features.map(feature => Room.fromGeoJson(feature)))
  }
}

export default RoomCollection

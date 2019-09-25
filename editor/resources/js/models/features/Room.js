import { get } from 'lodash/object'
import Feature from './Feature'
import { roomType } from '../../config'

/**
 * Representation of a room.
 *
 * @extends Feature
 */
class Room extends Feature {
  /**
   * @param {Object} feature
   */
  static fromGeoJson (feature) {
    return new Room(
      get(feature, 'geometry', []),
      get(feature, 'properties', {}),
      roomType
    )
  }

  /**
   * @param {L.Layer} layer
   * @returns L.Layer
   */
  addShape (layer) {
    // Clone the layer due to https://github.com/Leaflet/Leaflet.Editable/issues/192
    return super.addShape(this.cloneLayer(layer))
  }
}

export default Room

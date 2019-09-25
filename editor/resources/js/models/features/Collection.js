import { get } from 'lodash/object'
import Feature from './Feature'
import { collectionType } from '../../config'

class Collection extends Feature {
  static fromGeoJson (feature) {
    return new Collection(
      get(feature, 'geometry', []),
      get(feature, 'properties', {}),
      collectionType
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

export default Collection

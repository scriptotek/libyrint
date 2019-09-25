/**
 * @typedef {import("../../config").FeatureType} FeatureType
 */
import L from 'leaflet'
import { upperFirst } from 'lodash/string'
import EventMixin from '../EventMixin'

/**
 * Representation of a feature that can be added to a map, such as
 * a room, collection or marker. A feature maps to a Leaflet LayerGroup
 * and can contain any number of shapes / Leaflet layers.
 *
 * @mixes EventMixin
 */
class Feature {
  /**
   * Create an instance of this class.
   *
   * @param {Array.<Object>} geometry
   * @param {Object} properties
   * @param {FeatureType} type
   */
  constructor (geometry, properties, type) {
    console.log(`[Feature] Construct {${this.constructor.name}}`, properties)
    this.type = type
    this.style = type.style
    this.properties = properties
    this.selected = false
    this._layer = this.initLeafletLayers(geometry)
  }

  /**
   * @param {Array.<Object>} geometry
   * @returns L.LayerGroup<L.Layer>
   */
  initLeafletLayers (geometry) {
    return L.layerGroup(
      geometry.map(
        geo => {
          if (geo.type === 'Rectangle') {
            return L.rectangle(geo.coordinates, this.style.default)
          }
          if (geo.type === 'Polygon') {
            return L.polygon(geo.coordinates, this.style.default)
          }
          if (geo.type === 'Marker') {
            return L.marker(geo.coordinates)
          }
          throw new Error('Unknown geometry type: ' + geo.type)
        }
      )
    )
  }

  /**
   * @returns {L.LayerGroup}
   */
  getLayer () {
    return this._layer
  }

  /**
   * @returns {Object}
   */
  serialize () {
    return {
      properties: this.properties,
      geometry: this._layer.getLayers().map(layer => {
        let coordinates = []
        if (layer instanceof L.Path) {
          coordinates = layer.getLatLngs().map(
            x => x.map(y => [y.lat, y.lng])
          )
        } else {
          coordinates = [layer.getLatLng().lat, layer.getLatLng().lng]
        }

        return {
          type: this.getShapeType(layer),
          coordinates,
        }
      }),
    }
  }

  getProperty (name, defaultValue) {
    const customGetter = 'get' + upperFirst(name) + 'Value'
    if (this[customGetter] !== undefined) {
      return this[customGetter]() || defaultValue
    }
    return this.properties[name] || defaultValue
  }

  setProperty (name, value) {
    const oldValue = this.properties[name]
    if (oldValue === value) {
      return
    }
    console.log(`[Feature] Set property ${name}=`, value, ' Old value: ', oldValue)
    const customSetter = 'set' + upperFirst(name) + 'Value'
    if (this[customSetter] !== undefined) {
      this.properties[name] = this[customSetter](value)
    } else {
      this.properties[name] = value
    }
    this.emit('feature:propchange', name, value, oldValue)
  }

  setStyle (style) {
    // console.log('SET STYLE', style)
    this._layer.eachLayer(layer => {
      if (layer instanceof L.Path) {
        layer.setStyle(style)
      }
    })
  }

  /**
   * Set selected state to true or false.
   *
   * @param {Boolean} selected
   */
  setSelected (selected) {
    this.selected = selected
    if (selected) {
      // console.log('SET SEL STYLE', this.style.selected)
      this.setStyle(this.style.selected)
    } else {
      // console.log('SET STYLE', this.style.default)
      this.setStyle(this.style.default)
    }
    return this
  }

  cloneLayer (layer) {
    if (layer instanceof L.Rectangle) {
      return L.rectangle(layer.getLatLngs(), this.style.selected)
    }
    if (layer instanceof L.Polygon) {
      return L.polygon(layer.getLatLngs(), this.style.selected)
    }
  }

  /**
   * @param {L.Layer} layer
   * @returns L.Layer
   */
  addShape (layer) {
    console.log('ADDSHAPE', this._layer)
    layer.addTo(this._layer) // .addLayer(layer)
    console.log('[Feature] addShape', layer)
    this.emit('shape:created', layer, this)
    return layer
  }

  /**
   * @param {L.Layer} layer
   */
  deleteShape (layer) {
    this._layer.removeLayer(layer)
    this.emit('shape:deleted', layer, this)
  }

  /**
   * @returns {L.Layer[]}
   */
  getShapes () {
    return this._layer.getLayers()
  }

  /**
   * @param {L.Layer} layer
   */
  getShapeType (layer) {
    if (layer instanceof L.Rectangle) {
      return 'Rectangle'
    } else if (layer instanceof L.Polygon) {
      return 'Polygon'
    } else if (layer instanceof L.Marker) {
      return 'Marker'
    } else {
      throw new Error('Unknown shape type!')
    }
  }
}

Object.assign(Feature.prototype, EventMixin)

export default Feature

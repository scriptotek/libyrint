import L from 'leaflet'
import Feature from './Feature'
import { markerType } from '../../config'

class Marker extends Feature {
  static fromGeoJson (feature) {
    if (feature.properties.rotation === undefined) {
      feature.properties.rotation = '0'
      if (sessionStorage.getItem('LastUsedMarkerRotation') !== null) {
        feature.properties.rotation = sessionStorage.getItem('LastUsedMarkerRotation')
      }
    }
    return new Marker(feature.geometry, feature.properties, markerType)
  }

  /**
   * Custom getter for the rotation propertybundleRenderer.renderToStream
   *
   * @returns string
   */
  getRotationValue () {
    if (this.properties.rotation !== undefined) {
      return this.properties.rotation
    }
    // if (sessionStorage.getItem('LastUsedMarkerRotation') !== null) {
    //   return sessionStorage.getItem('LastUsedMarkerRotation')
    // }
    return '0'
  }

  /**
   * Custom setter for the rotation property. Whenever the value changes, we update
   * the marker icon by setting a `rotate-*` class.
   *
   * @protected
   * @param {string} value
   * @returns string
   */
  setRotationValue (value) {
    var classList = this.marker.getElement().querySelector('.customMarkerContainer').classList
    const classNames = [...classList.values()]
    classNames.filter(className => className.indexOf('rotate') !== -1)
      .forEach(className => {
        classList.remove(className)
      })
    classList.add(`rotate${value}`)

    return value
  }

  /**
   * @param {L.LatLngExpression} coordinates
   * @returns L.Layer
   */
  initLeafletMarker (coordinates) {
    console.log('initLeafletMarker')
    const rotation = this.getProperty('rotation')
    let className = `rotate${rotation}`
    if (this.selected) {
      className += ' selected'
    }

    const paddingPlusBorder = 3 + 2
    this.icon = L.divIcon({
      className: 'customMarker',
      iconSize: [30 + paddingPlusBorder * 2, 39 + paddingPlusBorder * 2],
      iconAnchor: [15 + paddingPlusBorder, 39 + paddingPlusBorder],
      html: `
        <div class="customMarkerContainer ${className}">
          <img src="https://ub-www01.uio.no/realfagsbiblioteket-kart/images/marker_30.png">
        </div>
      `,
    })

    this.marker = L.marker(coordinates, {
      icon: this.icon,
    })

    return this.marker
  }

  /**
   * @param {Array.<Object>} geometry
   * @returns L.LayerGroup<L.Layer>
   */
  initLeafletLayers (geometry) {
    return L.layerGroup(
      geometry.map(
        geo => {
          if (geo.type === 'Marker') {
            return this.initLeafletMarker(geo.coordinates)
          }
          throw new Error('Unknown geometry type: ' + geo.type)
        }
      )
    )
  }

  /**
   * @param {L.Layer} layer
   * @returns L.Layer
   */
  addShape (layer) {
    // Replace the Marker with a DivIcon
    layer = this.initLeafletMarker(layer.getLatLng())

    return super.addShape(layer)
  }

  /**
   * Set selected state to true or false.
   *
   * @param {Boolean} selected
   */
  setSelected (selected) {
    this.selected = selected
    this.selected = selected
    if (!this.marker) {
      return
    }
    if (selected) {
      this.marker.getElement().querySelector('.customMarkerContainer').classList.add('selected')
    } else {
      this.marker.getElement().querySelector('.customMarkerContainer').classList.remove('selected')
    }
    return this
  }
}
export default Marker

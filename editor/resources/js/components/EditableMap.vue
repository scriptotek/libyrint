<template>
  <!-- NOTE: THIS COMPONENT IS *NOT* REACTIVE -->
  <div
    v-once
    ref="map"
    class="editableMap"
  />
</template>

<script>
/**
 * @typedef {import("../models/features/Feature").default} Feature
 */
import L from 'leaflet'
import 'leaflet.path.drag'
import 'leaflet-editable'
import Room from '../models/features/Room'
import Collection from '../models/features/Collection'
import Marker from '../models/features/Marker'
import mapData from '../models/MapData'
import { featureTypes, IMAGE_BASE_URL } from '../config'
import MarkerEditPopup from '../popup/MarkerEditPopup'
import RoomEditPopup from '../popup/RoomEditPopup'
import CollectionEditPopup from '../popup/CollectionEditPopup'

export default {

  name: 'EditableMap',

  data () {
    return {
      /** @type {?Feature} */
      selectedFeature: null,
    }
  },

  mounted () {
    console.log('[MapEditor] Mounted with data:', mapData)

    // Note: Coordinates in CRS.Simple take the form of [y, x] instead of [x, y]
    const bgBounds = [
      [0, 0],
      [mapData.image.height, mapData.image.width],
    ]

    const mapBounds = [
      [-mapData.image.height * 0.30, -mapData.image.width * 0.10],
      [mapData.image.height * 1.30, mapData.image.width * 1.10],
    ]

    // Create background layer
    this.background = L.layerGroup([
      L.imageOverlay(
        IMAGE_BASE_URL + mapData.image.src,
        bgBounds,
        {
          // interactive: true, // to emit 'click' event
        },
      ),
    ])

    // Create additional layers
    const layers = {
      Kart: this.background,
    }
    featureTypes.forEach(featureType => {
      const collection = mapData[featureType.key]
      // collection.setStyle(styles[featureType.key].default)
      layers[featureType.collectionLabel] = collection.getLayer()
    })

    // Create Leaflet map
    this.map = L.map(this.$refs.map, {
      crs: L.CRS.Simple,
      maxBounds: mapBounds,
      maxBoundsViscosity: 0.8,
      minZoom: -3,
      maxZoom: 1,
      editable: true,
      layers: Object.values(layers),
    })

    // Add layer control
    // L.control.layers(null, layers, { collapsed: false }).addTo(this.map)

    // Create edit controls
    L.EditControl = L.Control.extend({
      options: {
        position: 'topleft',
        callback: null,
        kind: '',
        html: '',
      },
      onAdd: function (map) {
        // console.log('EditControl onAdd')
        var container = L.DomUtil.create('div', 'leaflet-control leaflet-bar')
        var link = L.DomUtil.create('a', '', container)

        link.href = '#'
        link.title = 'Create a new ' + this.options.kind
        link.innerHTML = this.options.html
        L.DomEvent
          .on(link, 'mousedown', L.DomEvent.stop)
          .on(link, 'click', L.DomEvent.stop)
          .on(link, 'click', function () {
            this.options.callback.call(map.editTools)
          }, this)

        return container
      },
    })

    L.NewRectangleControl = L.EditControl.extend({
      options: {
        position: 'topleft',
        callback: () => {
          if (this.selectedFeature === null) {
            return
          }
          return this.map.editTools.startRectangle(null, this.selectedFeature.type.style.selected)
        },
        kind: 'rectangle',
        html: '⬛',
      },
    })

    L.NewPolygonControl = L.EditControl.extend({
      options: {
        position: 'topleft',
        callback: () => {
          if (this.selectedFeature === null) {
            return
          }
          return this.map.editTools.startPolygon(null, this.selectedFeature.type.style.selected)
        },
        kind: 'polygon',
        html: '⬢',
      },
    })

    L.NewMarkerControl = L.EditControl.extend({
      options: {
        position: 'topleft',
        callback: () => {
          if (this.selectedFeature === null) {
            return
          }
          return this.map.editTools.startMarker()
        },
        kind: 'marker',
        html: '📌',
      },
    })

    this.editingControls = {
      rectangle: new L.NewRectangleControl(),
      polygon: new L.NewPolygonControl(),
      marker: new L.NewMarkerControl(),
    }

    // Initialize edit popup
    this.editPopups = {
      rooms: new RoomEditPopup(),
      collections: new CollectionEditPopup(),
      markers: new MarkerEditPopup(),
    }

    // Set view
    this.map.setView([500, 500], -3)

    this.isDrawing = false
    // Add click handlers
    this.map
      // .on('layerremove', ev => {
      //   console.log('ON: layerremove')
      // })
      // .on('layeradd', ev => {
      //   console.log('ON: layeradd')
      // })
      .on('editable:drawing:start', ev => {
        console.log('ON editable:drawing:start')
        this.$refs.map.classList.add('crosshair')
        this.isDrawing = true
      })
      .on('editable:drawing:end', ev => {
        this.$refs.map.classList.remove('crosshair')
        setTimeout(() => {
          console.log('ON editable:drawing:end')
          this.isDrawing = false
        })
      })
      .on('editable:dragstart', ev => {
        this.isDrawing = true
      })
      .on('editable:dragend', ev => {
        mapData.notify('shape:modified')
        setTimeout(() => { this.isDrawing = false })
      })
      .on('editable:vertex:dragstart', ev => {
        this.isDrawing = true
      })
      .on('editable:vertex:dragend', ev => {
        mapData.notify('shape:modified')
        setTimeout(() => { this.isDrawing = false })
      })
      .on('click', ev => {
        if (!this.isDrawing && this.selectedFeature !== null) {
          this.deselectFeature()
        }
      })

    // When map is ready
    this.$nextTick(() => {
      featureTypes.forEach(featureType => {
        mapData[featureType.key].forEach(feature => {
          // feature.getLayer().eachLayer(layer => layer.enableEdit())
          // feature.getLayer().eachLayer(layer => layer.editor.disable())
          feature.getLayer().eachLayer(layer => this.addClickHandler(layer, feature))
        })
      })

      // Add MapData event subscribers
      mapData
        .on('feature:created',
          /**
           * @param {Feature} feature
           */
          (feature) => {
            console.log('[EditableMap] on:feature:created')

            if (this.isDrawing) {
              console.log('Stop current drawing')
              this.map.editTools.stopDrawing()
              this.isDrawing = false
            }

            // const collectionLayer = mapData[feature.type.key].getLayer()
            this.selectFeature(feature)

            this.map.editTools.featuresLayer = feature.getLayer()

            if (feature instanceof Marker) {
              this.map.editTools.startMarker(null, feature.type.style.selected)
            } else {
              this.map.editTools.startRectangle(null, feature.type.style.selected)
            }
          })
        .on('feature:selected',
          /**
           * @param {Feature} feature
           */
          feature => {
            console.log('[EditableMap] on:feature:selected')

            if (this.isDrawing) {
              console.log('[EditableMap] Stop current drawing')
              this.map.editTools.stopDrawing()
              this.isDrawing = false
            }

            // Deselect currently selected feature
            if (this.selectedFeature !== null) {
              this.selectedFeature.setSelected(false)
              this.selectedFeature.getShapes().forEach(shape => shape.disableEdit())
            }

            // Style selected feature as selected
            if (feature !== null) {
              feature.setSelected(true)
            }

            this.selectedFeature = feature

            if (this.selectedFeature !== null) {
              this.selectedFeature.getShapes().forEach(shape => shape.enableEdit())
            }

            // this.selectedFeature.getShapes().forEach(layer => layer.enableEdit())

            // Update editing controls (after we have set this.selectedFeature)
            this.updateEditingControls()
          })
        .on('feature:deleted', feature => {
          console.log('[EditableMap] ON feature:deleted')
          // mapData[feature.type.key].remove(feature)
          if (this.isDrawing) {
            console.log('Stop current drawing')
            this.map.editTools.stopDrawing()
            this.isDrawing = false
          }
        })
    })

    // Add Leaflet event subscribers
    this.map
      .on('editable:drawing:commit', ev => {
        console.log('[EditableMap] on:editable:drawing:commit', ev.layer)

        const layer = ev.layer

        layer.removeFrom(this.map.editTools.featuresLayer)

        // ev.layer.removeFrom() remove from LayerGroup
        // this.map.editTools.featuresLayer.removeLayer(layer)
        // Add the new shape to the layer group of the currently selected feature
        // The Feature may return the same layer as given (ev.layer) or create
        // a new one (as in the case of Marker -> DivIcon)
        const shape = this.selectedFeature.addShape(layer)
        shape.enableEdit()

        console.log('ADDED shape', this.selectedFeature)

        // Add click handler
        this.addClickHandler(shape, this.selectedFeature)

        // Update editing controls
        this.updateEditingControls()

        // Open popup
        setTimeout(() => {
          console.log('BND', ev)
          // this.editPopups[this.selectedFeature.type.key].bindAndOpen(shape, this.selectedFeature, ev.latlng)
        })
      })
  },

  methods: {

    /**
     * Build a marker icon
     */
    buildMarkerIcon () {
      const className = (mapData.marker.rotation === 90 || mapData.marker.rotation === 270)
        ? `rotate${mapData.marker.rotation}`
        : ''

      return L.divIcon({
        className: 'customMarker',
        iconSize: [30, 39],
        iconAnchor: [15, 39],
        html: `
          <div class="${className}">
            <div class="animate">
              <img src="/realfagsbiblioteket-kart/images/marker_30.png">
            </div>
          </div>
         `,
      })
    },

    /**
     * Select a feature.
     *
     * @param {Feature} feature
     */
    selectFeature (feature) {
      console.log('[EditableMap] Select feature:', feature)
      mapData.selectFeature(feature)
    },

    /**
     * De-select the currently selected feature.
     */
    deselectFeature () {
      if (this.selectedFeature !== null) {
        mapData.selectFeature(null)
      }
    },

    /**
     * Add a click handler
     *
     * @param {*} layer (Leaflet layer)
     * @param {Feature} feature
     */
    addClickHandler (layer, feature) {
      layer
        .on('editable:vertex:click', L.DomEvent.stop).on('editable:vertex:click', ev => {
          this.selectFeature(feature)
        })
        .on('click', L.DomEvent.stop).on('click', ev => {
          if (this.isDrawing) return
          // console.log('CLICK', ev)
          if (ev.originalEvent.ctrlKey || ev.originalEvent.metaKey) {
            feature.deleteShape(layer)
            this.updateEditingControls()
            return
          }

          setTimeout(() => {
            this.selectFeature(feature)
            this.editPopups[feature.type.key].bindAndOpen(layer, feature, ev.latlng)
          })
        })
    },

    /**
     * Show editing controls relevant for the selected feature.
     */
    updateEditingControls () {
      if (this.selectedFeature instanceof Collection) {
        this.map.addControl(this.editingControls.rectangle)
        this.map.addControl(this.editingControls.polygon)
      } else if (this.selectedFeature instanceof Room && this.selectedFeature.getShapes().length === 0) {
        this.map.addControl(this.editingControls.rectangle)
        this.map.addControl(this.editingControls.polygon)
      } else {
        this.map.removeControl(this.editingControls.rectangle)
        this.map.removeControl(this.editingControls.polygon)
      }
      if (this.selectedFeature instanceof Marker && this.selectedFeature.getShapes().length === 0) {
        this.map.addControl(this.editingControls.marker)
      } else {
        this.map.removeControl(this.editingControls.marker)
      }
    },

  },
}
</script>

<style lang="css" scoped>
</style>

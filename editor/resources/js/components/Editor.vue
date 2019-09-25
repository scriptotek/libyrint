<template>
  <div id="editor">
    <div
      v-if="error"
      class="p-3 text-danger"
    >
      {{ error }}
    </div>
    <div
      v-if="mapDataReady"
      class="mapEditor"
    >
      <div id="info">
        <div
          v-if="saved"
          class="bg-success text-white text-center p-1"
        >
          Kartet ble lagret i databasen. En kopi ble kopiert til utklippstavlen din.
        </div>

        <div class="p-3">
          <strong>{{ rawData.name }}</strong>

          <button
            class="btn btn-success"
            type="button"
            :disabled="!modified"
            @click="saveMap"
          >
            Lagre
          </button>

          <button
            class="btn btn-success"
            type="button"
            @click="mapDataReady = false"
          >
            Endre bakgrunn
          </button>
        </div>

        <textarea
          ref="export"
          style="display: none"
        >YO</textarea>

        <div
          v-for="featureType in featureTypes"
          :key="featureType.key"
          class="p-3"
        >
          <div>
            <strong>{{ featureType.collectionLabel }}:</strong>
          </div>
          <div>
            <div
              v-for="feature in getFeatures(featureType.key)"
              :key="feature.properties.id"
              class="feature d-flex"
              :class="{'selected': selectedFeature === feature}"
              @click="selectFeature(feature)"
            >
              <div class="flex-grow-1">
                {{ feature.getProperty('name') }}
                <!--
                <small>[{{ getLayerCount(feature) }} objekt(er)]</small>
                -->
              </div>
              <div class="text-right">
                <a
                  href="#"
                  class="text-danger"
                  title="Delete this layer"
                  @click.stop="deleteFeature(feature)"
                ><font-awesome-icon :icon="['fas', 'minus-circle']" /></a>
              </div>
            </div>
            <button
              type="button"
              class="btn btn-success"
              @click="createFeature(featureType)"
            >
              <em class="fa fa-plus" />
              Legg til
            </button>
          </div>
        </div>
      </div>
      <editable-map />
    </div>
    <div
      v-else
      class="container m-3"
    >
      <div v-if="rawData">
        <h2>{{ rawData.name }}</h2>
        <BackgroundImageUploader
          :data="rawData"
          @uploaded="reload()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Api from '../api.js'
import EditableMap from './EditableMap.vue'
import BackgroundImageUploader from './BackgroundImageUploader.vue'
import mapData from '../models/MapData'
import { featureTypes } from '../config'
// import { find } from 'lodash/collection'
/**  @typedef {import("../config").FeatureType} FeatureType */
/**  @typedef {import("../models/features/Feature").default} Feature */

export default {

  name: 'Editor',

  components: {
    EditableMap,
    BackgroundImageUploader,
  },

  data () {
    return {
      saved: false,
      featureTypes,
      rooms: [],
      error: null,
      rawData: null,
      mapDataReady: false,
      selectedFeature: null,
      modified: false,
    }
  },

  computed: {
    mapId () {
      return this.$route.params.map
    },
  },

  beforeRouteUpdate (to, from, next) {
    console.log('[Editor] beforeRouteUpdate', to)
    this.openMap(to.params.map)
    next()
  },

  beforeDestroy () {
    window.removeEventListener('beforeunload', this.onBeforeUnloadHandler)
  },

  mounted () {
    this.onBeforeUnloadHandler = this.onBeforeUnload.bind(this)
    window.addEventListener('beforeunload', this.onBeforeUnloadHandler)

    this.openMap(this.mapId)

    mapData
      .on('feature:created feature:propchange feature:deleted shape:created shape:modified shape:deleted', () => {
        this.modified = true
      })
      .on('feature:created', feature => {
        // this.updateRooms()
      })
      .on('feature:selected', feature => {
        this.selectedFeature = feature
        // this.$forceUpdate()
      })
      .on('shape:created', () => {
        // console.log('[][] shape created')
        this.$forceUpdate()
      })
      .on('shape:deleted', (shape, feature) => {
        if (feature.getShapes().length === 0) {
          console.log('[Editor] Feature is empty. Delete it?')
          this.deleteFeature(feature)
        }
        this.$forceUpdate()
      })
      .on('feature:deleted', feature => {
        if (this.selectedFeature === feature) {
          console.log('[Editor] Select null')
          this.selectFeature(null)
        }
        this.$forceUpdate()
      })
  },

  methods: {
    getLayerCount (feature) {
      // console.log('getLayerCount()')
      const layer = feature.getLayer()
      if (layer) {
        return layer.getLayers().length
      }
    },

    loadImage (url) {
      console.log('Load ', url)
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.addEventListener('load', function () {
          resolve({
            src: url,
            width: this.naturalWidth,
            height: this.naturalHeight,
          })
        })
        img.addEventListener('error', function (err) {
          reject(err)
        })
        img.src = url
      })
    },

    onBeforeUnload (event) {
      if (this.modified) {
        // Cancel the event as stated by the standard.
        event.preventDefault()
        // Chrome requires returnValue to be set.
        event.returnValue = ''
      }
    },

    reload () {
      this.openMap(this.mapId)
    },

    // newFromImage () {
    //   this.error = false
    //   this.loadImage(this.image.src)
    //     .catch(err => {
    //       this.error = err
    //     })
    //     .then(imageData => {
    //       mapData.load({
    //         image: imageData,
    //         rooms: [],
    //         collections: [],
    //         markers: [],
    //       })
    //       this.mapDataReady = true
    //     })
    // },

    openMap () {
      console.log('[App] Open map: ', this.mapId)
      this.error = null
      this.mapDataReady = false

      Api.getMap(this.mapId)
        .then(data => {
          this.rawData = data
          if (!data.body.image) {
            return
          }
          mapData.load(data.body)
          // this.image = mapData.image
          // this.mapData = new MapData(response.data)
          this.mapDataReady = true
          // this.map = (new MapEditor('map', this.mapData)).build()
          // this.mapData.rooms.onUpdate(() => this.buildRooms())
          // this.buildRooms()
          // this.updateRooms()
        })
        .catch(err => {
          console.error(err)
          this.error = String(err)
        })
    },

    saveMap () {
      this.rawData.body = mapData.serialize()
      console.log('[App] Save map', this.rawData.body)
      Api.storeMap(this.rawData)
        .then(res => {
          this.modified = false
          const jsonString = JSON.stringify(this.rawData.body, null, 2)
          this.$refs.export.style.display = 'block'
          this.$refs.export.value = jsonString
          this.$refs.export.select()
          document.execCommand('copy')
          this.$refs.export.style.display = 'none'
          this.saved = true
          setTimeout(() => {
            this.saved = false
          }, 2000)
        })

      //       var data = new Blob(["Text data"], {type : "text/plain"});
      // navigator.clipboard.write(data).then(function() {
      //   console.log(“Copied to clipboard successfully!”);
      // }, function() {
      //   console.error(“Unable to write to clipboard. :-(”);
      // });
    },

    getFeatures (featureType) {
      return mapData[featureType] // .map(feature => feature)
    },

    updateRooms () {
      console.info('>>> [Editor] Re-compute rooms')
      this.rooms = mapData.rooms.map(room => room) /* ({
        id: room.properties.id,
        name: room.properties.name,
      })) */
    },

    /**
     * Create a new feature.
     *
     * @param {FeatureType} featureType
     */
    createFeature (featureType) {
      mapData.createFeature(featureType)
    },

    /**
     * Select a feature.
     *
     * @param {Feature} feature
     */
    selectFeature (feature) {
      // const feature = find(mapData[featureType], x => x.properties.id === featureId)
      console.log('[Editor] selectFeature', feature)
      mapData.selectFeature(feature)
    },

    /**
     * Delete a feature.
     *
     * @param {Feature} feature
     */
    deleteFeature (feature) {
      mapData.deleteFeature(feature)
    },
  },

}
</script>

<style lang="css" scoped>
</style>

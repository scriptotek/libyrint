<template>
  <div class="container p-3">
    <h3>
      <router-link :to="{ name: 'home' }">
        Libyrint-editor
      </router-link>
    </h3>
    <div
      v-if="library === null || error !== null"
      class="text-danger"
    >
      {{ error }}
    </div>
    <div v-else>
      <MapSelector :library="library" />
    </div>
  </div>
</template>

<script>
import Api from '../api.js'
import MapSelector from './MapSelector'
export default {
  name: 'LibraryHome',
  components: {
    MapSelector,
  },
  data () {
    return {
      library: null,
      error: null,
    }
  },
  async mounted () {
    try {
      this.library = await Api.getLibrary(this.$route.params.library)
    } catch (err) {
      console.error(err)
      this.error = err
    }
  },
}
</script>
